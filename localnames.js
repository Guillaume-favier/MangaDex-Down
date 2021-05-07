const fs = require('fs');
let bigFile = fs.readFileSync("./output.txt",'utf-8')
const clg = (c) => {
    console.log(c)
    bigFile+=c+"\n"
};
fs.readFile('./output.json', 'utf8', (err, data) => {

    if (err) {
        console.log(`Error reading file from disk: ${err}`);
    } else {

        // parse JSON string to JSON object
        const res = JSON.parse(data)["results"];
        clg("Il y a "+res.length+" manga")
        res.forEach(element => {
            const d = element["data"]
            const attr = d["attributes"]
            clg("----------------"+attr["title"]["en"]+"---------------------")
            clg("noms alternatifs : ")
            attr["altTitles"].forEach(e => {
                clg(e["en"])
            });
            if(attr["description"] != {} && attr["description"]["en"] != ""){
                bigFile +="synopsis : "
                clg(" "+attr["description"]["en"])
            }
            clg("type : "+JSON.stringify(d["type"],null,4))
            if (attr["tags"].length >= 1){
                clg("tags :")
                attr["tags"].forEach((e)=>{
                    clg(" -"+JSON.stringify(e["attributes"]["name"]["en"],null,4))
                })
            }
            console.log()
        });
        fs.writeFileSync('./output.txt', bigFile, 'utf8');
    }

});
