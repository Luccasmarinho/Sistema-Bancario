const fs = require("fs/promises");
const arquivo = "./src/transacoes.json";
const { cpfRepetido, verificandoEmail, emailRepetido, lendoArquivo, registroDates } = require("../funcoes");
// const { format } = require("date-fns")

async function listarContas(req, res) {
    try {
        const objJs = await lendoArquivo(arquivo)
        return res.json(objJs.contas)
    } catch (erro) {
        return res.json({ Erro: `${erro.message}` })
    }
}

async function CriarContas(req, res) {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ Mensagem: "Preencha todos os campos, pois todos eles são obrigatórios." })
    }

    const semPontosNoCPF = cpf.replaceAll(".", "");
    const cpfFormatado = semPontosNoCPF.replaceAll("-", "");

    try {
        const objJs = await lendoArquivo(arquivo)
        const { contas } = objJs;

        const cpfRepetidoPost = await cpfRepetido(res, cpfFormatado);

        if (cpfRepetidoPost) {
            return res.status(400).json({ Mensagem: "O CPF informado já existe cadastrado!" });
        }

        if (cpfFormatado.length !== 11) {
            return res.status(400).json({ Mensagem: "CPF inválido." })
        }

        if (telefone.length !== 11) {
            return res.status(400).json({ Mensagem: "Telefone inválido. O número de telefone deve conter o seguinte formato: 81912345678" })
        }

        const emailInvalido = await verificandoEmail(email)

        if (emailInvalido) {
            return res.status(400).json({ Mensagem: "Email inválido. Certifique-se do erro e tente novamente." });
        }

        const emailRepetidoPost = await emailRepetido(res, email);

        if (emailRepetidoPost) {
            return res.status(400).json({ Mensagem: "O email informado já existe cadastrado!" })
        }

        let indicadorConta = contas.length === 0 ? 1 : contas[contas.length - 1].numero + 1

        const addUsuario = {
            numero: indicadorConta,
            saldo: 0,
            usuario: {
                nome,
                cpf: cpfFormatado,
                data_nascimento,
                telefone,
                email,
                senha
            }
        }

        contas.push(addUsuario);

        const arrayStringify = JSON.stringify(objJs);
        await fs.writeFile(arquivo, arrayStringify);
        return res.status(201).json()

    } catch (erro) {
        return res.json({ Erro: `${erro.message}` })
    }

}

async function atualizarUsuario(req, res) {
    const numeroConta = Number(req.params.numeroConta);
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ Mensagem: "Preencha todos os campos, pois todos eles são obrigatórios." })
    }


    if (isNaN(numeroConta)) {
        return res.status(400).json({ Mensagem: "Digite um número da conta válido." });
    }

    try {
        const objJs = await lendoArquivo(arquivo)
        const { contas } = objJs;

        if (contas.length === 0) {
            return res.status(400).json({ Mensagem: "Nada para atualizar." })
        }

        const achandoNumeroDaConta = contas.find((elemento) => elemento.numero === numeroConta);

        if (!achandoNumeroDaConta) {
            return res.status(404).json({ Mensagem: "Número da conta não encontrado." });
        }

        const semPontosNoCPF = cpf.replaceAll(".", "");
        const cpfFormatado = semPontosNoCPF.replaceAll("-", "");

        const filtroCPF = contas.filter((elemento) => elemento.usuario)

        if (filtroCPF[numeroConta - 1].usuario.cpf !== cpfFormatado) {
            return res.status(400).json({ Mensagem: "O CPF não pode ser alterado, pois é único." })
        }

        if (cpfFormatado.length !== 11) {
            return res.status(400).json({ Mensagem: "CPF inválido." })
        }

        if (telefone.length !== 11) {
            return res.status(400).json({ Mensagem: "Telefone inválido. O número de telefone deve conter o seguinte formato: 81912345678" })
        }

        const emailInvalido = await verificandoEmail(email);

        if (emailInvalido) {
            return res.status(400).json({ Mensagem: "Email inválido. Certifique-se do erro e tente novamente." });
        }

        const achandoEmail = contas.find((elemento) => elemento.usuario.email === email)

        if (achandoEmail && achandoEmail.numero !== numeroConta) {
            return res.status(400).json({ Mensagem: "O email informado já existe cadastrado!" })
        }

        const indiceDoNumero = contas.findIndex((elemento) => elemento.numero === numeroConta);

        contas[indiceDoNumero].usuario.nome = nome
        contas[indiceDoNumero].usuario.cpf = cpfFormatado
        contas[indiceDoNumero].usuario.data_nascimento = data_nascimento
        contas[indiceDoNumero].usuario.telefone = telefone
        contas[indiceDoNumero].usuario.email = email
        contas[indiceDoNumero].usuario.senha = senha

        const arrayStringify = JSON.stringify(objJs)
        await fs.writeFile(arquivo, arrayStringify)

        return res.status(200).json();

    } catch (erro) {
        return res.status(400).json({ Erro: `${erro.message}` });
    }

}

async function deletarConta(req, res) {
    const numeroConta = Number(req.params.numeroConta);

    if (isNaN(numeroConta)) {
        return res.status(400).json({ Mensagem: "Digite um número da conta válido." });
    }

    try {
        const objJs = await lendoArquivo(arquivo)
        const { contas } = objJs;

        const achandoNumeroDaConta = contas.find((elemento) => elemento.numero === numeroConta)

        if (!achandoNumeroDaConta) {
            return res.status(404).json({ Mensagem: "Número da conta não encontrado." })
        }

        const achandoSaldoDaConta = contas.find((elemento) => elemento.saldo !== 0)

        if (achandoSaldoDaConta) {
            return res.status(400).json({ Mensagem: "A conta só pode ser removida se o saldo for zero!" })
        }

        const indiceConta = contas.findIndex((elemento) => elemento.numero === numeroConta)

        contas.splice(indiceConta, 1)

        const arrayStringify = JSON.stringify(objJs);
        await fs.writeFile(arquivo, arrayStringify);

        return res.status(204).json();

    } catch (erro) {
        return res.status(400).json({ Erro: `${erro.message}` })
    }
}

async function depositar(req, res) {
    const { numero_conta, valor } = req.body

    if (valor <= 0) {
        return res.status(400).json({ Mensagem: "Valor de depósito inválido." })
    }

    if (!numero_conta || !valor) {
        return res.status(400).json({ Mensagem: "O número da conta e o valor são obrigatórios!" });
    }

    if (isNaN(numero_conta)) {
        return res.status(400).json({ Mensagem: "Digite um número da conta válido." })
    }

    try {
        const objJs = await lendoArquivo(arquivo)
        const { contas, depositos } = objJs;

        const achandoNumeroDaConta = contas.find((elemento) => elemento.numero === Number(numero_conta))

        if (!achandoNumeroDaConta) {
            return res.status(404).json({ Mensagem: "Número da conta não encontrado." })
        }

        const date = await registroDates()

        const adicionarDeposito = {
            data: date,
            numero_conta,
            valor
        }

        depositos.push(adicionarDeposito)

        const indiceDaConta = contas.findIndex((elemento) => elemento.numero === Number(numero_conta))

        contas[indiceDaConta].saldo = achandoNumeroDaConta.saldo + valor

        const arrayStringify = JSON.stringify(objJs)
        await fs.writeFile(arquivo, arrayStringify)

        return res.status(204).json()
    } catch (erro) {
        return res.status(400).json({ Erro: `${erro.message}` })
    }
}

async function sacar(req, res) {
    const { numero_conta, valor, senha } = req.body

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({ Mensagem: "Preencha todos os campos, pois todos eles são obrigatórios." })
    }

    if (isNaN(numero_conta)) {
        return res.status(400).json({ Mensagem: "Digite um número de conta e/ou senha válidos." })
    }

    try {
        const objJs = await lendoArquivo(arquivo)

        const { contas, saques } = objJs;

        const achandoNumeroDaConta = contas.find((elemento) => elemento.numero === Number(numero_conta));

        if (!achandoNumeroDaConta) {
            return res.status(404).json({ Mensagem: "Número da conta não encontrado." });
        }

        if (achandoNumeroDaConta.usuario.senha !== senha) {
            return res.status(403).json({ Mensagem: "Senha inválida." })
        }

        if (achandoNumeroDaConta.saldo <= 0 || valor > achandoNumeroDaConta.saldo) {
            return res.status(403).json({ Mensagem: "Não há saldo suficiente para saque." })
        }

        achandoNumeroDaConta.saldo -= valor

        const date = await registroDates()

        const adicionarSaque = {
            data: date,
            numero_conta,
            valor
        }

        saques.push(adicionarSaque)

        const arrayStringify = JSON.stringify(objJs)
        await fs.writeFile(arquivo, arrayStringify)

        return res.status(204).json()
    } catch (erro) {
        return res.status(400).json({ Erro: `${erro.message}` });
    }
}

async function transferir(req, res) {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({ Mensagem: "Preencha todos os campos, pois todos eles são obrigatórios." });
    }

    if (valor <= 0) {
        return res.status(400).json({ Mensagem: "Digite um valor válido." })
    }

    try {
        const objJs = await lendoArquivo(arquivo)
        const { contas, transferencias } = objJs

        const achandoContaOrigem = contas.find((elemento) => elemento.numero == numero_conta_origem)
        const achandoContaDestino = contas.find((elemento) => elemento.numero == numero_conta_destino)

        if (!achandoContaOrigem && !achandoContaDestino) {
            return res.status(404).json({ Mensagem: "Conta de origem e conta de destino não encontradas." })

        }

        if (achandoContaOrigem == achandoContaDestino) {
            return res.status(400).json({ Mensagem: "O número da conta de origem não pode ser igual ao número da conta de destino." })
        }

        if (!achandoContaOrigem) {
            return res.status(404).json({ Mensagem: "Conta de origem não encontrada." })
        }

        if (!achandoContaDestino) {
            return res.status(404).json({ Mensagem: "Conta de destino não encontrada." })
        }

        if (achandoContaOrigem.usuario.senha !== senha) {
            return res.status(400).json({ Mensagem: "Senha inválida." })
        }

        if (achandoContaOrigem.saldo <= 0 || valor > achandoContaOrigem.saldo) {
            return res.status(400).json({ Mensagem: "Saldo insuficiente." })
        }

        achandoContaOrigem.saldo -= valor
        achandoContaDestino.saldo += valor

        const date = await registroDates()

        const adicionarTransferencia = {
            data: date,
            numero_conta_origem,
            numero_conta_destino,
            valor
        }

        transferencias.push(adicionarTransferencia)

        const arrayStringify = JSON.stringify(objJs)
        await fs.writeFile(arquivo, arrayStringify)

        return res.status(204).json()
    } catch (erro) {
        return res.status(400).json({ Erro: `${erro.message}` });

    }
}

async function consultarSaldo(req, res) {
    const { numero_conta } = req.query
    try {
        const objJs = await lendoArquivo(arquivo)
        const { contas } = objJs

        const achandoConta = contas.find((elemento) => elemento.numero == numero_conta)

        const saldoConta = {
            saldo: achandoConta.saldo
        }

        return res.status(200).json(saldoConta)
    } catch (erro) {
        return res.status(400).json({ Erro: `${erro.message}` });
    }
}

async function consultarExtrato(req, res) {
    const { numero_conta } = req.query;
    try {
        const objJs = await lendoArquivo(arquivo)
        const { saques, depositos, transferencias } = objJs

        const filtroDeposito = depositos.filter((elemento) => elemento.numero_conta == numero_conta)
        const filtroSaques = saques.filter((elemento) => elemento.numero_conta == numero_conta)
        const filtroTransferenciasEnviadas = transferencias.filter((elemento) => elemento.numero_conta_origem == numero_conta)
        const filtroTransferenciasRecebidas = transferencias.filter((elemento) => elemento.numero_conta_destino == numero_conta)


        const extrato = {
            depositos: filtroDeposito,
            saques: filtroSaques,
            transferenciasEnviadas: filtroTransferenciasEnviadas,
            transferenciasRecebidas: filtroTransferenciasRecebidas
        }

        return res.status(200).json(extrato)
        
    } catch(erro) {
        return res.status(400).json({ Erro: `${erro.message}` });

    }
}
module.exports = {
    listarContas,
    CriarContas,
    atualizarUsuario,
    deletarConta,
    depositar,
    sacar,
    transferir,
    consultarSaldo,
    consultarExtrato
}