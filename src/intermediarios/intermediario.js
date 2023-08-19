const { banco } = require("../bancodedados")

const verificarSenha = (req, res, next) =>{
    const { senha_banco } = req.query

    if (!senha_banco) {
        return res.status(404).json({ mensagen: 'Senha não informada' })
    }
    
    if(senha_banco !== banco.senha){
        return res.status(400).json({mensagem: 'Senha incorreta.'})
    }
    next()
}

module.exports = verificarSenha