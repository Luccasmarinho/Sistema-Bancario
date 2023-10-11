const express = require("express");
const rotas = express();

const { listarContas, CriarContas, atualizarUsuario, deletarConta, depositar, sacar, transferir, consultarSaldo, consultarExtrato } = require("./controllers/banco");
const { validacaoSenhaDoBanco, validacaoContaESenha } = require("./middlewares/validacao");


rotas.get("/contas", validacaoSenhaDoBanco, listarContas);
rotas.post("/contas", CriarContas);
rotas.put("/contas/:numeroConta/usuario", atualizarUsuario);
rotas.delete("/contas/:numeroConta", deletarConta);
rotas.post("/transacoes/depositar", depositar);
rotas.post("/transacoes/sacar", sacar);
rotas.post("/transacoes/transferir", transferir);
rotas.get("/contas/saldo", validacaoContaESenha, consultarSaldo);
rotas.get("/contas/extrato", validacaoContaESenha, consultarExtrato);


module.exports = rotas