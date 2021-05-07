const axios = require('axios')
const racine = "https://api.mangadex.org"
const LiamLink = "https://mangadex.org/chapter/1110565/2"
const secret = require("./secret")
const fs = require('fs');
let data = axios(
	{
		"url": escape("https")+":"+escape("//api.mangadex.org/chapter/6ca173ec-be04-432f-9e21-a74c818dd799"), 
		"method":"GET",
		// "options":{
		// 	"username":"Nimpsta",
		// 	"password":"fs61ov28&*",
		// 	"email":"favier.guillaume02@gmail.com"
		// }
	}
)
data.then((res)=>{
	console.log(`statusCode: ${res.statusCode}`)
	const data = JSON.stringify(res["data"],null,4);
	fs.writeFileSync('./output.json', data, 'utf8');
	console.log(res)
})
data.catch(err => console.log(err));