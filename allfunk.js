const axios = require('axios')
const racine = "https://api.mangadex.org"
const request = require('request')
const colors = require('colors/safe');
const fetch = require('node-fetch');
const prompt = require('prompt-sync')({sigint: true});
const highttest = (ques) => {
	while (true) {
		const un = prompt(ques+" [oui/non] > ")
		if (un.toLowerCase() === "oui") {
			return true
		}else if (un.toLowerCase() === "non"){
			return false
		}else{
			console.log(`Syntaxe : "${un}" incorrexte chois disponibles : [oui/non]`)
		}
	}
}
const hi = highttest("Voulez vous des images de bonne qualité ?")

const fs = require('fs');
const { title } = require('node:process')
const ttext = (obj) => {
	return JSON.stringify(obj,null,4)
}
const getchap = async (id) =>{
	return new Promise((resolve ,reject)=>{
		let done = false
		let data = axios(
			{
				"url": "https://api.mangadex.org/chapter/"+id, 
				"method":"GET"
			}
		)
		data.then(async (res)=>{
			let err = ""
			if (res["status"] == 204 || res["statusText"] == "No Content"){
				err += "Le chapitre n'existe pas !"
			}
			done = true
			resolve([res, err])
		})
		data.catch(err => console.err(err));
	})
}

const createFolder = (folderName, cbe) => {
	try {
		if (!fs.existsSync(folderName)) {
			fs.mkdirSync(folderName)
			return
		}
	} catch (err) {
		
		return cbe(err)
	}
}

const getmanga = async (id) =>{
	return new Promise((resolve ,reject)=>{
		let done = false
		let data = axios(
			{
				"url": "https://api.mangadex.org/manga/"+id, 
				"method":"GET"
			}
		)
		data.then(async (res)=>{
			let err = ""
			if (res["status"] == 204 || res["statusText"] == "No Content"){
				err += "Le manga n'existe pas !"
			}
			done = true
			resolve([res, err])
		})
		data.catch(err => console.err(err));
	})
}

const cooldisp = (data) => {
	if (data["result"] != "ok") {
		console.error("il n'y a pas de chapitre");
		console.log(ttext(data));
		return;
	}
	console.log(`-------------- Chapitre : ${data["data"]["attributes"]["title"]} -----------------`);
	if (data["data"]["attributes"]["volume"]) console.log(`volume : ${data["data"]["attributes"]["volume"]}`);
	if (data["data"]["attributes"]["chapter"]) console.log(`chapitre : ${data["data"]["attributes"]["chapter"]}`);
	if (data["data"]["attributes"]["translatedLanguage"]) console.log(`traduction : ${data["data"]["attributes"]["translatedLanguage"]}`);
	console.log(`il y a ${data["data"]["attributes"]["data"].length} pages`);
	console.log(`id : ${data["data"]["id"]}`);
	data["relationships"].forEach(element => {
		if (element["type"] == "manga") console.log("manga id : "+element["id"]);
	});
	if (data["data"]["attributes"]["publishAt"]) {
		const pub = new Date(data["data"]["attributes"]["publishAt"]);
		console.log("publié : "+pub.toLocaleDateString('fr-FR'));
	}if (data["data"]["attributes"]["createdAt"]) {
		const pub = new Date(data["data"]["attributes"]["createdAt"]);
		console.log("créé : "+pub.toLocaleDateString('fr-FR'));
	}
	if (data["data"]["attributes"]["updatedAt"]) {
		const pub = new Date(data["data"]["attributes"]["updatedAt"]);
		console.log("mise à jour : "+pub.toLocaleDateString('fr-FR'));
	}
}

let done = false;
let ok = true;
const getvischap = async(hight) => {
	while (ok){
		const id = prompt("Id du chapitre > ");
		if (id.toLowerCase() === "exit" || id.toLowerCase() === "quit") {
			console.log("bye")
			return;
		}
		let [res, err] = await getchap(id)
		if (err != ""){
			console.error("Erreur le chapitre n'existe pas ou n'existe plus !");
		}else{
			cooldisp(res["data"]);
			if (highttest("Voulez-vous le télécharger ? ")) {
				let mangaid = "";
				res["data"]["relationships"].forEach(element => {
					if (element["type"] == "manga") mangaid = element["id"];
				});
				const m = await getmanga(mangaid);
				manganame = m[0]["data"]["data"]["attributes"]["title"]["en"];
				createFolder("./out/");
				createFolder("./out/"+manganame);
				
				let volume = "";
				const data = res["data"];
				if (data["data"]["attributes"]["volume"]) {;
					volume = data["data"]["attributes"]["volume"]+"/";
				}else if (data["data"]["attributes"]["chapter"]) {;
					volume = data["data"]["attributes"]["chapter"]+"/";
				}else {}
				let dir = "./out/"+manganame+"/"+volume;
				createFolder(dir)
				let lol, url;
				if (hight) {
					lol = data["data"]["attributes"]["data"];
					url = "https://s2.mangadex.org/data/";
				}else{
					// console.log("object")
					lol = data["data"]["attributes"]["dataSaver"];
					url = "https://s2.mangadex.org/data-saver/";
				}
					// console.log("object")
				
				// console.log(data["data"]["attributes"]["data"])
				fs.appendFileSync(dir+"req.json", ttext(data));
				for (let i = 0; i < lol.length; i++) {
					// console.log(data["data"]["attributes"]["data"][i])
					const response = await fetch(url+data["data"]["attributes"]["hash"] +"/"+lol[i]);
					if (response['status'] === 404){
						console.error(`image n°${String(i+1)} isn't on the server`);
						continue;
					}
					const buffer = await response.buffer();
					let zero = '' ;
					for (let m = 0; m < String(lol.length).length - String(i+1).length ; m++) {
						zero +='0';
					}
					const test = dir+(i+1)+"."+(lol[i].split(".").slice(1));
					fs.writeFileSync(test, buffer);
					console.log(`image n°${i+1}/${lol.length} downloaded !`);
				}
			}
		}
		
	}
}

const search = async(limit=10,offset=0,title="") => {
	let args = ""
	if (title != "") {
		args+="&title="+escape(title)
	}
	return new Promise((resolve ,reject)=>{
		let done = false
		const args = {
			"offset":offset,
			"limit":limit,
			
		}
		let data = axios(
			{
				"url": "https://api.mangadex.org/manga?offset="+offset+"&limit="+limit+args, 
				"method":"GET",
				"params": args
			}
		)
		data.then(async (res)=>{
			let err = ""
			if (res["status"] == 204 || res["statusText"] == "No Content"){
				err += "Le manga n'existe pas !"
			}
			done = true
			resolve([res, err])
		})
		data.catch(err => console.err(err));
	})
}
const clg = (c) => console.log(c)
const cooldispmangas = (res) => {

	clg("Il y a "+res.length+" manga")
	res.forEach(element => {
		const d = element["data"]
		const attr = d["attributes"]
		clg("---------------- manga :"+attr["title"]["en"]+"---------------------")
		if (attr["altTitles"]){
			clg("noms alternatifs : ")
			attr["altTitles"].forEach(e => {
				clg(" - "+e["en"])
			});
		}
		console.log("ID : "+d["id"])
		if (attr["links"]){
			process.stdout.write("liens alternatifs : ")
			console.log(ttext(attr["links"]))
		}
		console.log("contenu : "+attr["contentRating"])
		if(attr["description"] != {} && attr["description"]["en"] != ""){
			process.stdout.write("synopsis : ");
			clg(" "+attr["description"]["en"]);
		}
		if (attr["createdAt"]) {
			console.log("Création : "+attr["createdAt"])
		}
		clg("type : "+JSON.stringify(d["type"],null,4))
		if (attr["tags"].length >= 1){
			clg("tags :")
			attr["tags"].forEach((e)=>{
				clg(" -"+JSON.stringify(e["attributes"]["name"]["en"],null,4))
			})
		}// console.log(d)
		console.log()
	});
}

const cooldispmanga = async(element) => {
	// console.log(element)
	const d = element["data"]
	const attr = d["attributes"]
	clg("\n---------------- manga :"+attr["title"]["en"]+"---------------------")
	if (attr["altTitles"]){
		clg("noms alternatifs : ")
		attr["altTitles"].forEach(e => {
			clg(" - "+e["en"])
		});
	}
	console.log("ID : "+d["id"])
	if (attr["links"]){
		process.stdout.write("liens alternatifs : ")
		console.log(ttext(attr["links"]))
	}
	console.log("contenu : "+attr["contentRating"])
	if(attr["description"] != {} && attr["description"]["en"] != ""){
		process.stdout.write("synopsis : ");
		clg(" "+attr["description"]["en"]);
	}
	if (attr["createdAt"]) {
		console.log("Création : "+attr["createdAt"])
	}
	clg("type : "+JSON.stringify(d["type"],null,4))
	if (attr["tags"].length >= 1){
		clg("tags :")
		attr["tags"].forEach((e)=>{
			clg(" -"+JSON.stringify(e["attributes"]["name"]["en"],null,4))
		})
	}
	console.log("chapitre : ")
	for (let i = 0; i < element["relationships"].length; i++) {
		const e = element["relationships"][i];
		if (e["type"] == "chapter"){
			const [res, err] = await getchap(e["id"])
			const d = res["data"]
			if (err != "Le chapitre n'existe pas !"){
				clg("  - name : "+d["data"]["attributes"]["title"])
				clg("    - langue : "+d["data"]["attributes"]["translatedLanguage"])
				clg("    - ID : "+d["data"]["id"])
				clg("    - chapitre : "+d["data"]["attributes"]["chapter"])
				// console.log(ttext(d))
			}else{
				console.log("chapitre mort")
				// console.log(res)
			}
		}
	}
	console.log()
	
}

const dispsearch = async() => {
	let done = false
	console.log("Est-ce que tu veux chercher un manga par titre ("+colors.blue("1")+").\nChercher un manga par ID ("+colors.blue("2")+")\nOu obtenir la liste des derniers mangas ("+colors.blue("3")+")\nQuitter ("+colors.blue("0")+")")
	while (!done) {
		const res1 = prompt("manga > ")
		switch (res1) {
			case "quit":
				return
			case "exit":
				return
			case "0":
				return
			case "clear":
				console.clear()
			case "1":
				const res2 = prompt("manga, titre > ")
				if (res2 == "exit" || res2 == "quit") break
				const [resp1, err1] = await search(10,0,res2)
				if (err1 != "") {
					console.error(err1)
					return
				}
				// console.log(res)
				cooldispmangas(resp1["data"]["results"])
				break
			case "2":
				const res3 = prompt("manga, ID > ")
				if (res2 == "exit" || res2 == "quit") break
				const [resp2, err2] = await getmanga(res3)
				if (err2 != "") {
					console.error(err2)
					return
				}
				// console.log(res)
				await cooldispmanga(resp2["data"])
			case "3":
				const [resp3, err3] = await search()
				if (err3 != "") {
					console.error(err3)
					return
				}
				// console.log(res)
				cooldispmangas(resp3["data"]["results"])
				break
			default:
				break;
		}
	}
}
console.log("\nEntrez "+colors.blue("\"help\"")+" pour voir la liste des commandes")
module.exports = {
	getvischap,
	cooldisp,
	ttext,
	getmanga,
	getchap,
	highttest,
	search,
	prompt,
	cooldispmangas,
	dispsearch
}