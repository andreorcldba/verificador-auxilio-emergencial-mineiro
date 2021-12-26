const puppeteer = require('puppeteer');
const fs = require('fs');
const writeStream = fs.createWriteStream("cpf_nis_com_auxilio.xls");
const writeStreamFalse = fs.createWriteStream("cpf_dados_incorretos.xls");

var header=`Codigo \n`;
writeStream.write(header);
writeStreamFalse.write(header);

isValidCPF = (number) => {
    var sum;
    var rest;
    sum = 0;
    if (number == "00000000000") return false;

    for (i=1; i<=9; i++) sum = sum + parseInt(number.substring(i-1, i)) * (11 - i);
    rest = (sum * 10) % 11;

    if ((rest == 10) || (rest == 11))  rest = 0;
    if (rest != parseInt(number.substring(9, 10)) ) return false;

    sum = 0;
    for (i = 1; i <= 10; i++) sum = sum + parseInt(number.substring(i-1, i)) * (12 - i);
    rest = (sum * 10) % 11;

    if ((rest == 10) || (rest == 11))  rest = 0;
    if (rest != parseInt(number.substring(10, 11) ) ) return false;
    return true;
}

checkData = async (cpf, nascimento) => {

    const browser = await puppeteer.launch({
        headless: true,
    });

    const page = await browser.newPage();
    
    await page.goto('https://auxilioemergencialmineiro.mg.gov.br');
    
    const inputCPF = await page.$('#no_table_cpf');
    const inputNascimento = await page.$('#no_table_resultado');

    await inputCPF.click();
    await page.keyboard.type(cpf)
    await inputNascimento.click();
    await page.keyboard.type(nascimento)
    await page.click('button');
    
    await page.waitForTimeout(3000)

    const text = await page.evaluate(() => {
        const anchor = document.querySelector('p:nth-child(4)');
        
        return anchor.textContent;
    });

    let status = text.indexOf("Você não atende aos critérios do Auxílio Emergencial Mineiro.") == -1 ? 0 : 1
    let invalid_data = text.indexOf("Preencha o  formulário corretamente") == -1 ? 0 : 1

    await browser.close();
    
    if(invalid_data){
        writeStreamFalse.write(`${cpf} \n`);
    }else if(!status) {
        writeStream.write(`${cpf} \n`);
    }
};

if(process.argv.length < 3) {
    console.log('Parâmetro não informado');
} else {
    var filename = process.argv[2];

    fs.readFile(filename, 'utf8', function(err, data) {
        if(filename.split('.')[1] !== 'txt') {
            console.log('Não foi possível abrir o arquivo pois a extenção não é .txt');
        } else if(!data){
            console.log('Arquivo não encontrado na raiz do script');
        }else{
            data = data.split(';');
            var obj = [];            
            var setCpf = null;
            var setDate = null;

            for (value in data) {

                if(value == 0) {
                    setCpf = `${data[value]}`;
                }else if(value % 2 === 0) {
                    setCpf = `${data[value]}`;
                } else {
                    setDate = `${data[value]}`;
                }

                if(setCpf !== null && setDate !== null) {
                    obj.push({cpf: setCpf,date: setDate});
                    
                    setCpf = null;
                    setDate = null;
                }
            }
            
            for (var letter in obj) {
                checkData(obj[letter].cpf, obj[letter].date);
            }
        }
    });
}