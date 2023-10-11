const arquivo = "./src/transacoes.json";
const { lendoArquivo } = require("../funcoes");

async function validacaoSenhaDoBanco (req, res, next) {
    const senhaCorreta = "Cubos123Bank"
    const { senha_banco } = req.query;

    if (!senha_banco) {
        return res.status(400).json({ Mensagem: "Digite a senha correta." });
    }

    if (senha_banco !== senhaCorreta) {
        return res.status(400).json({ Mensagem: "A senha do banco informada é inválida!."})
    }

    next()

}

async function validacaoContaESenha(req, res, next) {
    const { numero_conta, senha } = req.query

    if(!numero_conta || !senha) {
        return res.status(400).json({ Mensagem: "Digite o número da conta e senha" });
    }

    try {
        const objJs = await lendoArquivo(arquivo)
        const { contas } = objJs
        
        const achandoConta = contas.find((elemento) => elemento.numero == numero_conta)

        if (!achandoConta) {
            return res.status(404).json({ Mensagem: "Conta bancária não encontrada." })
        }

        if (achandoConta.usuario.senha !== senha) {
            return res.status(400).json({ Mensagem: "Senha inválida." })
        }

        next()
    } catch(erro) {
        return res.status(400).json({ Erro: `${erro.message}` });

    }
}

module.exports = {
    validacaoSenhaDoBanco,
    validacaoContaESenha
}