const path = require ('path')

module.exports = function (grunt) {

	const lf = grunt.util.linefeed

	grunt.registerMultiTask ('add_h', 'Adds the H tag', function () {
	
        let data = this.data

        let tag = 'h'  + data.level
        let bra = '<'  + tag + '>'
        let ket = '</' + tag + '>'
        
        for (let f of grunt.file.expand (data.src)) {
        	let txt = grunt.file.read (f)
			grunt.file.write (f, bra + path.basename (f, '.html').replace (/-/g, ' ') + ket + lf + txt)
        }
        
	})

	grunt.registerMultiTask ('del_last_ul', 'Deletes the last UL', function () {
	        
        for (let f of grunt.file.expand (this.data.src)) {
        	let lines = grunt.file.read (f).split (/[\r\n]+/)
        	let idx = lines.lastIndexOf ('<ul>')
			if (idx > -1) grunt.file.write (f, lines.slice (0, idx).join (lf))
        }
        
	})
	
	let targets = {
	
		panda: {},
		
		add_h: {},

		del_last_ul: {
		
			elu_dia_docs: {
						
				src: [
					'html/elu_dia_docs/Устройство-Web-приложения.html',
					'html/elu_dia_docs/Динамические-запросы.html',
//					'html/dia_js/Серверная библиотека Dia.js.html',
				],

			},

		},

		concat: {

			elu_dia_docs: {

				options: {			
					banner: '<html><head><meta charset="utf-8"><style>body{font-family:Arial}</style></head><body>' + lf,
					footer: lf + '</body></html>',				
				},

				src: [],
				dest: 'html/elu_dia_docs.html',				
				
			}
		
		},
		
		wkhtmltopdf: {
			build: {
				src: 'html/elu_dia_docs.html',
				dest: 'docs/',
				args: [
					'--outline-depth', 10,		
					'--footer-center', '[page]',
					'cover', 'cover.html',
				],
        	}
		},
		
		clean: {
			html: ['html']
		},
		
	}
	
	for (let line of grunt.file.read ('src/toc.txt').split (/[\r\n]+/)) {

		let level = 0; while (level < line.length && line.charAt (level) == ' ') level ++

		let [path, name]  = line.trim ().split (/\t/)
		let [part, label] = path.split ('/')

		if (!name) name   = label
		
		let html          = `html/${part}/${label}.html`

		level ++

		if (!(level in targets.panda)) targets.panda [level] = {files: {}, options: {pandocOptions: '-f mediawiki -t html --shift-heading-level-by ' + level}}		
		targets.panda [level].files [html] = `src/${part}/${name}.mediawiki`
		
		if (!(level in targets.add_h)) targets.add_h [level] = {level, src: []}
		targets.add_h [level].src.push (html)

		targets.concat.elu_dia_docs.src.push (html)

	}
console.log (targets.panda)
console.log (targets.add_h)
	grunt.initConfig (targets)

	grunt.loadNpmTasks ('grunt-panda')
	grunt.loadNpmTasks ('grunt-contrib-concat')
	grunt.loadNpmTasks ('grunt-contrib-clean')
	grunt.loadNpmTasks ('grunt-wkhtmltopdf')
	
	grunt.registerTask ('build', [
		'panda',
		'add_h',
		'del_last_ul',
		'concat',
		'wkhtmltopdf',
	])

	grunt.registerTask ('default', [
		'clean',
		'build',
//		'clean',
	])

};