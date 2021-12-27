const puppeteer = require('puppeteer');
const fs = require('fs');
const writeStream = fs.createWriteStream("cpf_nis_com_auxilio.xls");

const header=`Codigo \n`;

const boot = async (cpf_data, date_data, page, filename, count_data) => {
    
    console.log('\x1b[34m', `Progresso "${count_data[1]}/${count_data[0]}"`);
    console.log('\x1b[34m', `Iniciando consulta no CPF/NIS "${cpf_data}"`);

    const inputCPF = await page.$('#no_table_cpf');
    const inputNascimento = await page.$('#no_table_resultado');
            
    await inputCPF.click();
    await page.evaluate( () => document.getElementById("no_table_cpf").value = "");
    await page.keyboard.type(cpf_data);
    await inputNascimento.click();
    await page.evaluate( () => document.getElementById("no_table_resultado").value = "");
    await page.keyboard.type(date_data);
    await page.click('button');

    await page.waitForTimeout(3000);

    const text = await page.evaluate(() => {
        const anchor = document.querySelector('p:nth-child(4)');
                    
        return anchor.textContent;
    });
            
    let status = text.indexOf("Você atende aos critérios do Auxílio Emergencial") != -1 ? 0 : 1;

    if(!status) {
        if(writeStream.write(`${cpf_data} \n`)) {
            console.log('\x1b[32m', `CPF/NIS ${cpf_data} gravado no arquivo "${filename}"`);
        }else {
            console.log('\x1b[31m', 'Erro inesperado ao tentar gravar o arquivo');
        }
    }else {
        console.log('\x1b[31m', 'Este registro não foi gravado pois não possui direito ao benefício');
    }
}

const loadTxt = async (data, filename) => {

    data = data.split(';');         
    var cpf_data = null;
    var date_data = null;
    var key_function = 'cpf';

    console.log('\x1b[34m', `Preparando emulador do navegador...`);
    
    const browser = await puppeteer.launch({
        headless: false,
    });
        
    const page = await browser.newPage();
        
    await page.goto('https://auxilioemergencialmineiro.mg.gov.br');

    console.log('\x1b[34m', `Preparando para percorrer arquivo "${filename}"`);
    
    let count_data = [(data.length-1)/2, 1];

    for (value in data) {
        
        if(key_function == 'cpf') {
            cpf_data = `${data[value].trim()}`;
            key_function = 'nascimento';
        } else {
            date_data = `${data[value].trim()}`;
            key_function = 'cpf';
        }
        
        if(cpf_data !== null && date_data !== null) {

            await boot(cpf_data, date_data, page, filename, count_data);
            
            count_data[1] ++;
            cpf_data = null;
            date_data = null;
        }
    }
    await browser.close();
    console.log('\x1b[32m', `Importação finalizada com sucesso. Verifique o arquivo ${filename} para consultar os CPF/NIS que possuem direito ao benefício.`);
}

const write = () => {
    const filename = process.argv[2];

    fs.readFile(filename, 'utf8', function(err, data) {
        if(filename.split('.')[1] !== 'txt') {
            console.log('\x1b[31m', 'Não foi possível abrir o arquivo pois a extenção não é .txt');
        } else if(!data){
            console.log('\x1b[31m', 'Arquivo não encontrado na raiz do script');
        }else{
            console.log('\x1b[32m', 'Validação de parâmetros finalizada');

            if(data) {
                loadTxt(data, filename);
            } else {
                console.log('\x1b[31m', err);
            }
        }
    });
}

const read = () => {
    console.log('\x1b[32m', 'Iniciando...');
    console.log('\x1b[34m', 'Preparando arquivos...');
    
    writeStream.write(header);
    process.setMaxListeners(0);

    console.log('\x1b[34m', 'Verificando parâmetros...');
    
    if(process.argv.length < 3) {
        console.log('\x1b[31m', 'Parâmetro não informado...');
        console.log('\x1b[31m', 'Fim da execução');
    } else {
        write();
    }
}

read();