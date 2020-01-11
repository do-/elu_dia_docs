const path = require ('path')

module.exports = function (grunt) {

	const lf = grunt.util.linefeed

	grunt.registerMultiTask ('fix_html', 'Adds the H tag', function () {
	
        let data = this.data
        let tag  = 'h'  + data.level
        
        for (let f of data.srcc) {

        	let lines = [`<span id="${f.name}">`]
        	if (f.name != f.label) lines.push (`<span id="${f.label}">`)
			lines.push (`<${tag}>${f.label.replace (/-/g, ' ')}</${tag}></span>`)
        	if (f.name != f.label) lines.push ('</span>')
        	
			for (let line of grunt.file.read (f.html).split (/[\n\r]+/)) {
			
				if (line.indexOf ('data-end') > -1) break
				
				lines.push (line
					.replace (/<a href="(.*?)" title="wikilink">/g, 
						(match, p1, p2, offset, string) => 
							`<a href="#${p1}" title="wikilink">`)
				)

			}

			grunt.file.write (f.html, lines.join (lf))

        }
        
	})

	let targets = {panda: {}, fix_html: {}, clean: {html: ['html']},

		concat: {

			elu_dia_docs: {

				options: {			
					banner: '<html><head><meta charset="utf-8"><style>body{font-family:Arial; font-size:12pt;}h1{page-break-before: always;}</style></head><body>' + lf,
					footer: lf + '</body></html>',				
				},

				src: ['intro.html'],
				dest: 'html/elu_dia_docs.html',				
				
			}
		
		},
		
		wkhtmltopdf: {
			build: {
				src: 'html/elu_dia_docs.html',
				dest: 'docs/',
				args: [
					'--dpi', 200,		
					'--outline-depth', 10,		
					'--footer-center', '[page]',
					'cover', 'cover.html',
					'--enable-internal-links',
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
		
		if (!(level in targets.fix_html)) targets.fix_html [level] = {level, srcc: []}
		targets.fix_html [level].srcc.push ({html, name, label})

		targets.concat.elu_dia_docs.src.push (html)

	}

//	for (let k of ['panda', 'fix_html']) console.log (targets [k])

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