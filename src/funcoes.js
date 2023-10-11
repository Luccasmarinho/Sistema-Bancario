const fs = require("fs/promises");
const { format } = require("date-fns");
const arquivo = "./src/transacoes.json";

async function cpfRepetido(res, a) {
    try {
        const transacoes = await fs.readFile(arquivo);
        const objJs = JSON.parse(transacoes);
        const { contas } = objJs;

        const encontrandoCpfRepetido = contas.find((elemento) => elemento.usuario.cpf === a);

        return encontrandoCpfRepetido
    } catch (erro) {
        return res.json({ Erro: `${erro.message}` })
    }

}

async function verificandoEmail(email) {
    const indiceArroba = email.indexOf("@");

    const a = !email.includes("@") || email[0] === "@" || email[email.length - 1] === "@";
    const b = email[indiceArroba + 1] === "." || email[indiceArroba - 1] === ".";
    const c = !email.includes(".", indiceArroba + 1) || email[0] === "." || email[email.length - 1] === ".";

    return a || b || c
}

async function emailRepetido(res, a) {
    try {
        const transacoes = await fs.readFile(arquivo);
        const objJs = JSON.parse(transacoes);
        const { contas } = objJs;

        const encontrandoEmailRepetido = contas.find((elemento) => elemento.usuario.email === a);

        return encontrandoEmailRepetido
    } catch (erro) {
        return res.json({ Erro: `${erro.message}` })
    }
}

async function lendoArquivo(arquivo) {
    const transacoes = await fs.readFile(arquivo);
    const objJs = JSON.parse(transacoes);

    return objJs
}

async function registroDates() {
    try {
        const date =  new Date()
        const dateFormatada =  format(date, "yyyy-MM-dd HH:mm:ss")

        return dateFormatada
    } catch(erro) {
        return res.json({ Erro: `${erro.message}` })
    }
}

module.exports = {
    cpfRepetido,
    verificandoEmail,
    emailRepetido,
    lendoArquivo,
    registroDates
}