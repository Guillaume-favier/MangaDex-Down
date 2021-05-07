const colors = require('colors/safe');
const title = require('./title.js')

const {
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
} = require('./allfunk.js')


let done = false
const main = async () => {
	while (!done) {
		const command = prompt(">").toLowerCase()
		if (command == "exit" || command == "quit" ) {
			process.exit(0)
		}else if (command == "recherche"){
			await dispsearch()
		}else if(command == "chap"){
			await getvischap()
		}else if(command == "help"){
			console.log("  - "+colors.blue("exit")+", "+colors.blue("quit")+" : ferme le programme\n  - "+colors.blue("recherche")+" : permet de rechercher un manga par son titre, son ID ou voir les nouveautés\n  - "+colors.blue("chap")+" : permet de télécharger un chapitre à partir de son ID")
		}else if(command == "clear" || command == "^L"){
			console.clear();
		}
		else{
			console.log("La commande : \""+command+"\" n'a pas été trouvé. Entrez \"help\" pour avoir de l'aide")
		}
	}
}
main()