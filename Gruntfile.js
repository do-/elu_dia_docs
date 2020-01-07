const path = require ('path')

module.exports = function (grunt) {

	const lf = grunt.util.linefeed

	grunt.registerMultiTask ('fix_html', 'Adds the H tag', function () {
	
        let data = this.data

        let tag = 'h'  + data.level
        let bra = '<'  + tag + '>'
        let ket = '</' + tag + '>'
        
        for (let f of grunt.file.expand (data.src)) {
        
        	let lines = [bra + path.basename (f, '.html').replace (/-/g, ' ') + ket]
        	
			for (let line of grunt.file.read (f).split (/[\n\r]+/)) {
				if (line.indexOf ('data-end') > -1) break
				lines.push (line)
			}

			grunt.file.write (f, lines.join (lf))

        }
        
	})

	let targets = {panda: {}, fix_html: {}, clean: {html: ['html']},

		concat: {

			elu_dia_docs: {

				options: {			
					banner: '<html><head><meta charset="utf-8"><style>body{font-family:Arial; font-size:12pt;}h1{page-break-before: always;}</style></head><body>' + lf,
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
		
		if (!(level in targets.fix_html)) targets.fix_html [level] = {level, src: []}
		targets.fix_html [level].src.push (html)

		targets.concat.elu_dia_docs.src.push (html)

	}

	for (let k of ['panda', 'fix_html']) console.log (targets [k])

	grunt.initConfig (targets)

	grunt.loadNpmTasks ('grunt-panda')
	grunt.loadNpmTasks ('grunt-contrib-concat')
	grunt.loadNpmTasks ('grunt-contrib-clean')
	grunt.loadNpmTasks ('grunt-wkhtmltopdf')
	
	grunt.registerTask ('build', [
		'panda',
		'fix_html',
		'concat',
		'wkhtmltopdf',
	])

	grunt.registerTask ('default', [
		'clean',
		'build',
//		'clean',
	])

};