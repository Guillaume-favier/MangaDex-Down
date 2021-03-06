const colors = require('colors/safe');
const title = require('./title.js')


const {
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
} = require('./allfunk.js')


let done = false
const main = async () => {
	while (!done) {
		const command = prompt(">").toLowerCase()
		if (command == ll["quitcmd"][0] || command == ll["quitcmd"][1] ) {
			process.exit(0)
		}else if (command == ll["searchcmd"]){
			await dispsearch()
		}else if(command == ll["chaptercmd"]){
			await dlallchap(hi)
		}else if(command == ll["helpcmd"]){
			console.log("  - "+colors.blue(ll["quitcmd"][0])+", "+colors.blue(ll["quitcmd"][1])+" : "+ll["quitdesc"]+"\n  - "+colors.blue(ll["searchcmd"])+" : "+ll["searchdesc"]+"\n  - "+colors.blue(ll["chaptercmd"])+" : "+ll["chapdesc"])
		}else if(command == ll["clearcmd"]){
			console.clear();
		}
		else{
			console.log(ll["notfound"][0]+"\""+command+"\""+ll["notfound"][1]+"\"help\""+ll["notfound"][2])
		}
	}
}
main()