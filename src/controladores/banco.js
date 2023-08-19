let { contas, saques, depositos, transferencias } = require('../bancodedados')
const format = require('date-fns/format')

let idConta = '0'

const listarContasBancarias = (req, res) => {
    //eu gostaria de usar o status 204 em caso de nao ter conta mas quando uso da pau xD
    return res.json(contas)
}

const criarContaBancaria = (req, res) => {
    const { nome, email, cpf, data_nascimento, telefone, senha } = req.body

    if (!nome) {
        return res.status(400).json({ mensagem: 'O nome não foi informado.' })
    }
    if (!email) {
        return res.status(400).json({ mensagem: 'O email não foi informado' })
    }
    if (!cpf) {
        return res.status(400).json({ mensagem: 'O cpf nao foi informado' })
    }
    if (!data_nascimento) {
        return res.status(400).json({ mensagem: 'A data de nascimento não foi informada.' })
    }
    if (!telefone) {
        return res.status(400).json({ mensagem: 'O telefone não foi informado.' })
    }
    if (!senha) {
        return res.status(400).json({ mensagem: 'A senha não foi informada' })
    }

    if (cpf) {
        const verificarCpf = contas.some((documento) => {
            return documento.usuario.cpf === cpf
        })
        if (verificarCpf) {
            return res.status(400).json({ mensagem: 'o CPF informado já existente.' })
        }
    }

    if (email) {
        const verificarEmail = contas.some((contaEmail) => {
            return contaEmail.usuario.email === email
        })
        if (verificarEmail) {
            return res.status(400).json({ mensagem: 'O email informado já existe.' })
        }
    }

    let idContaNumero = Number(idConta)
    let numero = String(idContaNumero + 1)


    let contaUsuario = {
        numero,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }

    contas.push(contaUsuario)
    idConta = String(idContaNumero + 1)
    return res.status(201).json(contaUsuario)
}

const atualizarUsuario = (req, res) => {
    const { numeroConta } = req.params
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    let encontrarConta = contas.find((conta) => {
        return conta.numero === numeroConta
    })


    if (!nome && !cpf && !data_nascimento && !telefone && !email && !senha) {
        return res.status(404).json({ mensagem: 'Informe ao menos um campo para atualizar' })
    }

    if (!encontrarConta) {
        return res.status(404).json({ mensagem: 'Conta não encontrada' })
    }

    if (cpf) {
        const verificarCpf = contas.some((documento) => {
            return documento.usuario.cpf === cpf
        })
        if (verificarCpf) {
            return res.status(400).json({ mensagem: 'o CPF informado já existente.' })
        }
    }

    if (email) {
        const verificarEmail = contas.some((contaEmail) => {
            return contaEmail.usuario.email === email
        })
        if (verificarEmail) {
            return res.status(400).json({ mensagem: 'O email informado já existe.' })
        }
    }
    if (nome) {
        encontrarConta.usuario.nome = nome
    }

    if (cpf) {
        encontrarConta.usuario.cpf = cpf
    }

    if (data_nascimento) {
        encontrarConta.usuario.data_nascimento = data_nascimento
    }

    if (telefone) {
        encontrarConta.usuario.telefone = telefone
    }

    if (email) {
        encontrarConta.usuario.email = email
    }

    if (senha) {
        encontrarConta.usuario.senha = senha
    }
    return res.status(201).json({ mensagem: 'Conta atualizada com sucesso' })
}

const excluirContaBancaria = (req, res) => {
    const { numeroConta } = req.params

    const contaExiste = contas.find((conta)=>{
        return conta.numero === numeroConta
    })

    if(!contaExiste){
        return res.status(404).json({mensagem: 'Essa conta não existe.'})
    }

    if(contaExiste.saldo !== 0){
        return res.status(400).json({mensagem: 'Não podemos excluir conta com saldo'})
    }

    contas = contas.filter((excluir)=>{
        return excluir.numero !== numeroConta
    })
    return res.json({mensagem: 'Conta excluido com sucesso'})
}

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body

    if (!numero_conta || !valor) {
        return res.status(404).json({ mensagem: 'Algum campo não foi informado.' })
    }

    const verificarExistenciaConta = contas.some((conta) => {
        return conta.numero === numero_conta
    })

    if (!verificarExistenciaConta) {
        return res.status(404).json({ mensagem: 'Conta inexistente.' })
    }

    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'Número inválido, negativo ou igual a zero' })
    }

    const dataRegistroDeposito = new Date()
    const dataFormatada = format(dataRegistroDeposito, "yyyy-MM-dd kk:mm:ss")

    const registroDeDeposito = {
        data: dataFormatada,
        numero_conta,
        valor
    }

    depositos.push(registroDeDeposito)

    contas.forEach((conta) => {
        if (conta.numero === numero_conta) {
            conta.saldo += valor
        }
        return res.json({ mensagem: 'Deposito realizado com sucesso'})
    })

}

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body

    if (!numero_conta || !valor || !senha) {
        return res.status(404).json({ mensagem: 'Informe todos os campos obrigátorios.' })
    }

    const contaEncontrada = contas.find((conta) => {
        return conta.numero === numero_conta
    })

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: 'Numero da conta inválido.' })
    }

    if (contaEncontrada.usuario.senha !== senha) {
        return res.status(400).json({ mensagem: 'Senha incorreta' })
    }

    if (contaEncontrada.saldo < valor) {
        return res.json({ mensagem: 'O valor a ser sacado é maior que o saldo existente.' })
    }

    const dataRegistroDeposito = new Date()
    const dataFormatada = format(dataRegistroDeposito, "yyyy-MM-dd kk:mm:ss")

    const registroSaque = {
        data: dataFormatada,
        numero_conta,
        valor
    }

    saques.push(registroSaque)
    contaEncontrada.saldo -= valor

    return res.json({ mensagem: 'Saque realizado com sucesso' })
}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({ mensagem: 'Informe todos os campos obrigatorios.' })
    }

    const verificarContaOrigem = contas.find((contaOrigem) => {
        return contaOrigem.numero === numero_conta_origem
    })

    const verificarContaDestino = contas.find((contaDestino) => {
        return contaDestino.numero === numero_conta_destino
    })

    if (!verificarContaOrigem) {
        return res.status(404).json({ mensagem: 'A conta de origem informada não existe' })
    }

    if (!verificarContaDestino) {
        return res.status(404).json({ mensagem: 'A conta de destino não existe.' })
    }

    if(numero_conta_destino === numero_conta_origem){
        return res.status(400).json({mensagem: 'Não pode transferir para a mesma conta.'})
    }

    if (senha !== verificarContaOrigem.usuario.senha) {
        return res.status(400).json({ mensagem: 'Senha incorreta.' })
    }

    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'O valor...' })
    }
    if (valor > verificarContaOrigem.saldo) {
        return res.status(400).json({ mensagem: 'O valor informado é maior que o saldo existente na conta de origem' })
    }

    const dataRegistroDeposito = new Date()
    const dataFormatada = format(dataRegistroDeposito, "yyyy-MM-dd kk:mm:ss")

    const registroTransferencia = {
        data: dataFormatada,
        numero_conta_origem,
        numero_conta_destino,
        valor
    }

    transferencias.push(registroTransferencia)

    verificarContaOrigem.saldo -= valor
    verificarContaDestino.saldo += valor

    return res.status(200).json({ mensagem: 'Sucesso ao realizar trânsferencia.' })
}

const consultarSaldo = (req, res) => {
    const { numero_conta, senha } = req.query

    if (!numero_conta || !senha) {
        return res.status(404).json({ mensagem: 'Parametro não informado.' })
    }

    const contaExiste = contas.find((conta) => {
        return conta.numero === numero_conta
    })

    if (!contaExiste) {
        return res.status(404).json({ mensagem: 'A conta não existe' })
    }

    if (senha !== contaExiste.usuario.senha) {
        return res.status(400).json({ mensagem: 'Senha incorreta.' })
    }

    return res.status(200).json({ saldo: contaExiste.saldo })
}

const extrato = (req, res) => {
    const { numero_conta, senha } = req.query

    if (!numero_conta || !senha) {
        return res.status(404).json({ mensagem: 'Algum campo não foi informado' })
    }

    const contaExiste = contas.find((conta) => {
        return conta.numero === numero_conta
    })

    if (!contaExiste) {
        return res.status(404).json({ mensagem: 'A conta não existe.' })
    }

    if (senha !== contaExiste.usuario.senha) {
        return res.status(404).json({ mensagem: 'Senha incorreta.' })
    }

    const saquesConta = saques.filter((saque) => {
        return saque.numero_conta === numero_conta
    })

    const depositosConta = depositos.filter((deposito) => {
        return deposito.numero_conta === numero_conta
    })

    const transferenciasEnviadas = transferencias.filter(
        (transferencia) => transferencia.numero_conta_origem === numero_conta
    )

    const transferenciasRecebidas = transferencias.filter(
        (transferencia) => transferencia.numero_conta_destino === numero_conta
    );

    return res.status(200).json({
        saques: saquesConta,
        depositos: depositosConta,
        transferencias_enviadas: transferenciasEnviadas,
        transferencias_recebidas: transferenciasRecebidas,
    });

}
module.exports = {
    listarContasBancarias,
    criarContaBancaria,
    atualizarUsuario,
    excluirContaBancaria,
    depositar,
    sacar,
    transferir,
    consultarSaldo,
    extrato
}