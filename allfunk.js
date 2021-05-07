const axios = require('axios')
const racine = "https://api.mangadex.org"
const color = require('colors/safe');
const fs = require("fs")
var ProgressBar = require('progress');
const fetch = require('node-fetch');
const prompt = require('prompt-sync')({sigint: true});
const data = require('./lang.json')
const ll = data[data["c"]]
const highttest = (ques) => {
	while (true) {
		const un = prompt(ques+" ["+color.blue(ll["yes"])+"/"+ll["no"]+"] > ")
		if (un.toLowerCase() === ll["yes"]) {
			return true
		}else if (un.toLowerCase() === ll["no"]){
			return false
		}else{
			console.log(color.red(ll["syntaxerror"])+" : \""+un+"\" "+ll["isnotavaliable"]+" ["+color.blue(ll["yes"])+"/"+color.blue(ll["no"])+"]")
		}
	}
}

const hi = highttest(ll["imagequality"])

const ttext = (obj) => {
	return JSON.stringify(obj,null,4)
}
const getchap = async (id) =>{
	return new Promise((resolve ,reject)=>{
		let done = false
		let data = axios(
			{
				"url": racine+"/chapter/"+id, 
				"method":"GET"
			}
		)
		data.then(async (res)=>{
			let err = ""
			if (res["status"] == 204 || res["statusText"] == "No Content"){
				err += ll["nochapter"]
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
const getchaps = async (id, limc = 10, off= 0) =>{
	return new Promise((resolve ,reject)=>{
		let done = false
		let data = axios(
			{
				"url": racine+"/chapter?manga="+id+"&limit="+limc+"&offset="+off, 
				"method":"GET"
			}
		)
		data.then(async (res)=>{
			let err = ""
			if (res["status"] == 204 || res["statusText"] == "No Content"){
				err += ll["nomanga"]
			}
			done = true
			resolve([res, err])
		})
		data.catch(err => console.err(err));
	})
}

const getmanga = async (id) =>{
	return new Promise((resolve ,reject)=>{
		let done = false
		let data = axios(
			{
				"url": racine+"/manga/"+id, 
				"method":"GET"
			}
		)
		data.then(async (res)=>{
			let err = ""
			if (res["status"] == 204 || res["statusText"] == "No Content"){
				err += ll["nomanga"]
			}
			done = true
			resolve([res, err])
		})
		data.catch(err => console.err(err));
	})
}

const cooldisp = (data) => {
	if (data["result"] != "ok") {
		console.error(ll["nochapter"]);
		console.log(ttext(data));
		return;
	}
	console.log(`-------------- ${ll["Chapter"]} : ${data["data"]["attributes"]["title"]} -----------------`);
	if (data["data"]["attributes"]["volume"]) console.log(`${ll["volume"]} : ${data["data"]["attributes"]["volume"]}`);
	if (data["data"]["attributes"]["chapter"]) console.log(`${ll["chapter"]} : ${data["data"]["attributes"]["chapter"]}`);
	if (data["data"]["attributes"]["translatedLanguage"]) console.log(`${ll["traduction"]} : ${data["data"]["attributes"]["translatedLanguage"]}`);
	console.log(`${ll["thereis"]} ${data["data"]["attributes"]["data"].length} ${ll["pages"]}`);
	console.log(`ID : ${data["data"]["id"]}`);
	data["relationships"].forEach(element => {
		if (element["type"] == "manga") console.log(ll["mangaid"]+" : "+element["id"]);
	});
	if (data["data"]["attributes"]["publishAt"]) {
		const pub = new Date(data["data"]["attributes"]["publishAt"]);
		console.log(ll["published"]+" : "+pub.toLocaleDateString(data["c"]));
	}if (data["data"]["attributes"]["createdAt"]) {
		const pub = new Date(data["data"]["attributes"]["createdAt"]);
		console.log(ll["created"] +" : "+pub.toLocaleDateString(data["c"]));
	}
	if (data["data"]["attributes"]["updatedAt"]) {
		const pub = new Date(data["data"]["attributes"]["updatedAt"]);
		console.log(ll["updated"] +" : "+pub.toLocaleDateString(data["c"]));
	}
}


const search = async(limit=10,offset=0,title="") => {
	let args = ""
	if (title != "") {
		args+="&title="+escape(title)
	}
	return new Promise((resolve ,reject)=>{
		let done = false
		let data = axios(
			{
				"url": "https://api.mangadex.org/manga?offset="+offset+"&limit="+limit+args, 
				"method":"GET"
			}
		)
		data.then(async (res)=>{
			let err = ""
			if (res["status"] == 204 || res["statusText"] == "No Content"){
				err += ll["nomanga"]
			}
			done = true
			resolve([res, err])
		})
		data.catch(err => console.err(err));
	})
}
const clg = (c) => console.log(c)
const cooldispmangas = (res) => {

	clg(ll["Thereis"] +" "+res.length+" "+ll["manga"])
	res.forEach(element => {
		const d = element["data"]
		const attr = d["attributes"]
		clg("---------------- "+ll["manga"] +" :"+attr["title"]["en"]+"---------------------")
		if (attr["altTitles"]){
			clg(ll["altnames"] +" : ")
			attr["altTitles"].forEach(e => {
				clg(" - "+e["en"])
			});
		}
		console.log("ID : "+d["id"])
		if (attr["links"]){
			process.stdout.write(ll["altlinks"] +" : ")
			console.log(ttext(attr["links"]))
		}
		console.log("contenu : "+attr["contentRating"])
		if(attr["description"] != {} && attr["description"]["en"] != ""){
			process.stdout.write(ll["synopsis"] +" : ");
			clg(" "+attr["description"]["en"]);
		}
		if (attr["createdAt"]) {
			console.log(ll["Created"] +" : "+attr["createdAt"])
		}
		clg("type : "+JSON.stringify(d["type"],null,4))
		if (attr["tags"].length >= 1){
			clg(ll["tags"] +" : ")
			attr["tags"].forEach((e)=>{
				clg(" -"+JSON.stringify(e["attributes"]["name"]["en"],null,4))
			})
		}// console.log(d)
		console.log()
	});
}
const dlallchap = async(hi) => {
	const mangaid = prompt("manga ID > ")
	const [resm, errm] = await getmanga(mangaid)
	if (errm != "") {
		console.error(errm)
		return
	}
	const lang = prompt("lang > ")
	console.log("Big Start")
	let time = Date.now()
	let nreq = 0
	i=0
	let nope = false
	while (!nope) {
		const [res, err] = await getchaps(mangaid,100,i*100)
		const lul = res["data"]["results"]
		if (lul.length < 100) {
			nope = true
		}
		nreq++
		if (nreq >= 5) {
			while (Date.now-5000 <=time) {
				
			}
			time = Date.now()
			nreq = 0
		}
		for (let j = 0; j < lul.length; j++) {
			// console.log("new chap")
			const data = lul[j]
			const manganame = resm["data"]["data"]["attributes"]["title"]["en"]
			createFolder("./out/");
			createFolder("./out/"+manganame);
			let volume = "";
			if (data["data"]["attributes"]["translatedLanguage"] != lang) {
				// console.log("\n\n rejeté (lang : "+data["data"]["attributes"]["translatedLanguage"]+") \n")
				continue
			}
			if (data["data"]["attributes"]["chapter"]) {;
				volume = data["data"]["attributes"]["chapter"]+"/";
			}
			let dir = "./out/"+manganame+"/"+volume;
			// console.log("dir : "+ dir)
			createFolder(dir)
			let lol, url;
			if (hi) {
				lol = data["data"]["attributes"]["data"];
				url = "https://s2.mangadex.org/data/";
			}else{
				// console.log("object")
				lol = data["data"]["attributes"]["dataSaver"];
				url = "https://s2.mangadex.org/data-saver/";
			}
				// console.log("object")
			
			// console.log(data["data"]["attributes"]["data"])
			fs.appendFile(dir+"req.json", ttext(data),()=>{});
			var bar = new ProgressBar(' Chapitre n°'+data["data"]["attributes"]["chapter"]+' [:bar] lang:'+data["data"]["attributes"]["translatedLanguage"], { 
				complete: '=',
    			incomplete: ' ',
    			"head": ">",
				width: 20,
    			total: lol.length });
			for (let k = 0; k < lol.length; k++) {
				// console.log(data["data"]["attributes"]["data"][i])
				const response = await fetch(url+data["data"]["attributes"]["hash"] +"/"+lol[k]);
				if (response['status'] === 404){
					console.error(ll["nimage"] +String(k+1)+" "+ll["noimage"] );
					continue;
				}
				const buffer = await response.buffer();
				const test = dir+(k+1)+"."+(lol[k].split(".").slice(1));
				fs.writeFile(test, buffer,()=>{
					bar.tick();
					if (bar.complete) {
						console.log('complete                                     \n\n');
					}
				});
			}
		}
		i++
	}
}

const cooldispmanga = async(element) => {
	// console.log(element)
	const d = element["data"]
	const attr = d["attributes"]
	clg("\n---------------- "+ll["manga"]+" :"+attr["title"]["en"]+"---------------------")
	if (attr["altTitles"]){
		clg(ll["altnames"]+" : ")
		attr["altTitles"].forEach(e => {
			clg(" - "+e["en"])
		});
	}
	console.log("ID : "+d["id"])
	if (attr["links"]){
		process.stdout.write(ll["altlinks"]+" : ")
		console.log(ttext(attr["links"]))
	}
	console.log(ll["content"]+" : "+attr["contentRating"])
	if(attr["description"] != {} && attr["description"]["en"] != ""){
		process.stdout.write(ll["sinopsis"]+" : ");
		clg(" "+attr["description"]["en"]);
	}
	if (attr["createdAt"]) {
		console.log(ll["Created"]+" : "+attr["createdAt"])
	}
	clg("type : "+JSON.stringify(d["type"],null,4))
	if (attr["tags"].length >= 1){
		clg("tags :")
		attr["tags"].forEach((e)=>{
			clg(" -"+JSON.stringify(e["attributes"]["name"]["en"],null,4))
		})
	}
	console.log(ll["chapter"]+" : ")
	const [res, err] = await getchaps(d["id"])
	const lol = res["data"]["results"]
	for (let i = 0; i < lol.length; i++) {
		//const [res, err] = await getchap(e["id"])
		const d = lol[i]
		if (err != ll["nochapter"]){
			clg("  - "+ll["name"]+" : "+d["data"]["attributes"]["title"])
			clg("    - "+ll["language"]+" : "+d["data"]["attributes"]["translatedLanguage"])
			clg("    - ID : "+d["data"]["id"])
			clg("    - "+ll["chapter"]+" : "+d["data"]["attributes"]["chapter"])
			// console.log(ttext(d))
		}else{
			console.log(ll["deadchap"])
			// console.log(res)
		}
		
	}
	console.log()
	
}

const dispsearch = async() => {
	let done = false
	console.log(ll["searchdesclong"][0]+"("+color.blue("1")+").\n"+ll["searchdesclong"][1]+"("+color.blue("2")+")\n"+ll["searchdesclong"][2]+"("+color.blue("3")+")\n"+ll["searchdesclong"][3]+"("+color.blue("0")+")")
	while (!done) {
		const res1 = prompt(ll["manga"]+" > ")
		switch (res1) {
			case ll["quitcmd"][0]:
				return
			case ll["quitcmd"][1]:
				return
			case "0":
				return
			case ll["clearcmd"]:
				console.clear()
			case "1":
				const res2 = prompt(ll["manga"]+", "+ll["title"]+" > ")
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
				const res3 = prompt(ll["manga"]+", ID > ")
				if (res3 == "exit" || res3 == "quit") break
				const [resp3, err3] = await getmanga(res3)
				if (err3 != "") {
					console.error(err3)
					return
				}
				// console.log(res)
				await cooldispmanga(resp3["data"])
				break
			case "3":
				const [resp4, err4] = await search()
				if (err4 != "") {
					console.error(err4)
					return
				}
				// console.log(res)
				cooldispmangas(resp4["data"]["results"])
				break
			default:
				break;
		}
	}
}
console.log("\n"+ll["dispHelp"][0]+color.blue(" \""+ll["helpcmd"]+"\"")+ll["dispHelp"][1])

module.exports = {
	cooldisp,
	ttext,
	getmanga,
	getchap,
	highttest,
	search,
	prompt,
	cooldispmangas,
	dispsearch,
	hi,
	ll,
	dlallchap
}