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

	grunt.initConfig ({
	
		panda: {

			elu_dia_docs_0: {
			
				options: {
					pandocOptions: '-f mediawiki -t html --shift-heading-level-by 0',
				},			

				files: {
					'html/Устройство-Web-приложения.html': 'src/elu_dia_docs.wiki/Home.mediawiki',
				},

			},

			elu_dia_docs_1: {
			
				options: {
					pandocOptions: '-f mediawiki -t html --shift-heading-level-by 2',
				},			

				files: {
					'html/Общие-положения.html': 'src/elu_dia_docs.wiki/Общие-положения.mediawiki',
					'html/Статические-запросы.html': 'src/elu_dia_docs.wiki/Статические-запросы.mediawiki',
					'html/Динамические-запросы.html': 'src/elu_dia_docs.wiki/Динамические-запросы.mediawiki',
				},

			},
			
			elu_dia_docs_2: {
			
				options: {
					pandocOptions: '-f mediawiki -t html --shift-heading-level-by 3',
				},			

				files: {
					'html/Общий-формат-запросов.html': 'src/elu_dia_docs.wiki/Общий-формат-запросов.mediawiki',
					'html/Общий-формат-ответов.html': 'src/elu_dia_docs.wiki/Общий-формат-ответов.mediawiki',
				},

			},
			
		},
		
		add_h: {
		
			elu_dia_docs_1: {
			
				level: 1,
			
				src: [
					'html/Устройство-Web-приложения.html',
				],

			},
		
			elu_dia_docs_2: {
			
				level: 2,
			
				src: [
					'html/Общие-положения.html',
					'html/Статические-запросы.html',
					'html/Динамические-запросы.html',
				],

			},

			elu_dia_docs_3: {
			
				level: 3,
			
				src: [
					'html/Общий-формат-запросов.html',
					'html/Общий-формат-ответов.html',
				],

			},
			
		},		
		
		del_last_ul: {
		
			elu_dia_docs: {
						
				src: [
					'html/Устройство-Web-приложения.html',
					'html/Динамические-запросы.html',
				],

			},
			
		},		
		
		concat: {
		
			elu_dia_docs: {
				
				options: {			
					banner: '<html><head><meta charset="utf-8"><style>body{font-family:Arial}</style></head><body>' + lf,
					footer: lf + '</body></html>',				
				},
			
				dest: 'html/elu_dia_docs.html',
				
				src: [
					'html/Устройство-Web-приложения.html',
					'html/Общие-положения.html',
					'html/Статические-запросы.html',
					'html/Динамические-запросы.html',
					'html/Общий-формат-запросов.html',
					'html/Общий-формат-ответов.html',
				]
				
			}
		
		},
		
		wkhtmltopdf: {
			build: {
				src: 'html/elu_dia_docs.html',
				dest: 'pdf/',
				args: [
					'--outline-depth', 10,		
					'--footer-center', '[page]',
					'cover', 'cover.html',
				],
        	}
		}		

	})

	grunt.loadNpmTasks ('grunt-panda')
	grunt.loadNpmTasks ('grunt-contrib-concat')
	grunt.loadNpmTasks ('grunt-wkhtmltopdf')

	grunt.registerTask ('elu_dia_docs_to_html', [
		'panda:elu_dia_docs_0',
		'panda:elu_dia_docs_1',
		'panda:elu_dia_docs_2',
	])
	
	grunt.registerTask ('elu_dia_docs_fix_html', [
		'add_h:elu_dia_docs_1',
		'add_h:elu_dia_docs_2',
		'add_h:elu_dia_docs_3',
		'del_last_ul',
	])
	
	grunt.registerTask ('default', [
		'elu_dia_docs_to_html',
		'elu_dia_docs_fix_html',
		'concat:elu_dia_docs',
		'wkhtmltopdf',
	])

};