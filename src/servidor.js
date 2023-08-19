const express = require('express');
const app = express();
const controladores = require('./controladores/banco');
const verificarSenha = require('./intermediarios/intermediario');

app.get('/contas', verificarSenha, controladores.listarContasBancarias)
app.post('/contas', controladores.criarContaBancaria)
app.put('/contas/:numeroConta/usuario', controladores.atualizarUsuario)
app.delete('/contas/:numeroConta', controladores.excluirContaBancaria)
app.post('/transacoes/depositar', controladores.depositar)
app.post('/transacoes/sacar', controladores.sacar)
app.post('/transacoes/transferir', controladores.transferir)
app.get('/contas/saldo', controladores.consultarSaldo)
app.get('/contas/extrato', controladores.extrato)

module.exports = app;