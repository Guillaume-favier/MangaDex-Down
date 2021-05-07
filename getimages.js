const axios = require('axios')
const racine = "https://api.mangadex.org"
const LiamLink = "https://mangadex.org/chapter/1110565/2"
const secret = require("./secret")
const request = require('request')
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
const hight = highttest("Voulez vous des images de bonne qualité ?")

const fs = require('fs');
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
		console.error("il n'y a pas de chapitre")
		console.log(ttext(data))
		return
	}
	console.log(`--------------${data["data"]["attributes"]["title"]}-----------------`)
	if (data["data"]["attributes"]["volume"]) console.log(`volume : ${data["data"]["attributes"]["volume"]}`)
	if (data["data"]["attributes"]["chapter"]) console.log(`chapitre : ${data["data"]["attributes"]["chapter"]}`)
	if (data["data"]["attributes"]["translatedLanguage"]) console.log(`traduction : ${data["data"]["attributes"]["translatedLanguage"]}`)
	console.log(`il y a ${data["data"]["attributes"]["data"].length} pages`)
	console.log(`id : ${data["data"]["id"]}`)
	data["relationships"].forEach(element => {
		if (element["type"] == "manga") console.log("manga id : "+element["id"])
	});
	if (data["data"]["attributes"]["publishAt"]) {
		const pub = new Date(data["data"]["attributes"]["publishAt"])
		console.log("publié : "+pub.toLocaleDateString('fr-FR'))
	}if (data["data"]["attributes"]["createdAt"]) {
		const pub = new Date(data["data"]["attributes"]["createdAt"])
		console.log("créé : "+pub.toLocaleDateString('fr-FR'))
	}
	if (data["data"]["attributes"]["updatedAt"]) {
		const pub = new Date(data["data"]["attributes"]["updatedAt"])
		console.log("mise à jour : "+pub.toLocaleDateString('fr-FR'))
	}
}

let done = false
let ok = true
const getvischap = async(hight) => {
	while (ok){
		const id = prompt("Id du chapitre > ")
		if (id.toLowerCase() === "exit" || id.toLowerCase() === "quit") {
			return
		}
		let [res, err] = await getchap(id)
		if (err != ""){
			console.error("Erreur le chapitre n'existe pas ou n'existe plus !")
		}else{
			cooldisp(res["data"])
			if (highttest("Voulez-vous le télécharger ? ")) {
				let manganame = ""
				res["data"]["relationships"].forEach(element => {
					if (element["type"] == "manga") mangaid = element["id"]
				});
				const m = await getmanga(mangaid)
				let manganame = m[0]["data"]["data"]["attributes"]["title"]["en"]
				createFolder("./out/")
			}
		}
		
	}
}
getvischap()