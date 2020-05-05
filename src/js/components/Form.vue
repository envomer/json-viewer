<script>

function copyObject(obj) {
    return JSON.parse(JSON.stringify(obj));
};

function toCamel(str) {
    return str.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
};

function dot(str, obj) {
    if( typeof str === 'string' && str.indexOf('.') === -1 && typeof obj === 'object' ) {
        return obj[str];
    }
    else if( ! str ) {
        return obj;
    }
    // loop through all keys and every time, get set the obj to the new one
    var keys = str.split('.'), nwObj = obj, i;
    for(i = 0; i < keys.length; i++) {
        if( typeof nwObj === 'undefined' || ! nwObj ) return null;
        nwObj = nwObj[ keys[i] ];
    }
    return nwObj;
};

function on(e,t,f,r){
    if(e.attachEvent?(r?e.detachEvent('on'+t,e[t+f]):1):(r?e.removeEventListener(t,f,0):e.addEventListener(t,f,0))){e['e'+t+f]=f;e[t+f]=function(){e['e'+t+f](window.event)};e.attachEvent('on'+t,e[t+f])}
};

function sendNotify(title, message, type, timer) {
    helpers.notify(title, message, type, timer);
};

function fireEvent(element, name) {
    var event; // The custom event that will be created

    if (document.createEvent) {
        event = document.createEvent('HTMLEvents');
        event.initEvent(name, true, true);
    } else {
        event = document.createEventObject();
        event.eventType = name;
    }

    event.eventName = name;

    if (document.createEvent) {
        element.dispatchEvent(event);
    } else {
        element.fireEvent('on' + event.eventType, event);
    }
};

var timers = {
    glob: { timeout: [] },
    page: { timeout: [] },
};

function startTimeout(func, time, glob) {
    if( typeof glob === 'function' ) {
        const tmp = func;
        func = glob;
        glob = time;
        time = tmp;
    }

    if( typeof time === 'function' ) {
        const tmp = func;
        func = time;
        time = tmp;
    }

    var timer = setTimeout(func, time);
    timers[glob ? 'glob' : 'page'].timeout.push(timer);
    return timer;
};

var isAdvancedUpload = function() {
  var div = document.createElement('div');
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

function isValueValid(value) {
	return typeof value !== 'undefined' && value !== null;
}

export default {

	computed: {
		supportsUpload () {
			if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
				return false
			}
			const el = document.createElement('input')
			el.type = 'file'
			return !el.disabled
		},
		supportsPreview () {
			return window.FileReader && !!window.CanvasRenderingContext2D
		},
		supportsDragAndDrop () {
			const div = document.createElement('div')
			return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && !('ontouchstart' in window || navigator.msMaxTouchPoints)
		},
	},

	/**
	 * Data
	 */
	data() {
		return {
			colors: [
	            "#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50", "#f1c40f",
	            "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6", "#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d"
		    ],
			inputLabels: ['checkbox'],
			form: this.fill || {},
			isFile: false,
			filled: null,
			keypadComma: null,
			isSending: false,
			test: null,
			// lang: {
			// 	save: Tls.save
			// }
		}
	},

	/**
	 * Properties
	 */
	props: {
		autofocus: false,
		classes: String,
		elements: Object,
		fill: {},
		labels: {
            'default' : true
        },
		name: '',
		submit: {
			type: [String, Object, Function],
			default: null
		}, //Function or string
		target: '',
		title: String,
		toggle: String,
		hideActions: false,
		lang: {},
		value: null
	},

	model: {
		event: 'change'
	},

	/**
	 *
	 * onReady
	 *
	 */

	mounted() {
		this.$nextTick(() => {
			let self = this;
			self.filled = self.fill ? copyObject(self.fill) : {};

			if(self.value) {
				self.form = copyObject(self.value);
			}

			self.focusElement();

			for( let item in self.elements ) {
				let el = self.elements[item];
				if( typeof el.type !== "undefined" ) {
					if( el.type === 'keypad' && typeof el.fill !== "undefined" ) {
						self.keypadFill(el, item);
					}
					// else if( el.wysiwyg ) {
					// 	app.fn.wysiwyg(item, 'form-el-' + item, el.options);
					// }
					// else if(el.type === 'colorpicker') {
						
					// }
					else if( el.type === 'upload' ) {
						if( ! el.url ) return true;
						let opts = {
							url: el.url,
							maxFiles: el.max || 1,
							thumbnailHeight: 100,
							thumbnailWidth: 100,
							complete: function(file, a, b, c) {
								let response = JSON.parse(file.xhr.response);
								if( response.success ) {
									// self.form[el.id] = response.path;
									self.form[item].path = response.path;
									this.removeFile(file);
								} else {
									sendNotify(null, resp.msg, resp.success);
								}
							}
						};
						let myDropzone = new Dropzone('#form-el-' + item, opts);
					}
				}
			}

			fireEvent(self.$el, 'ready');
			startTimeout(500, () => {
				// self.colorPickerInit();
			});
		})
	},

	watch: {
		'fill' : 'fillInForm',
	},

	/**
	 *
	 * Methods
	 *
	 */

	methods: {
		t(word, amount) {
			// return app.fn.t(word, amount);
		},

		clearCalendarInput(id) {
			// let input = app._.id(id);
			input.value = '';
			fireEvent(input, 'change');
		},

		/**
		 * Close form popup
		 *
		 * @return {[type]}
		 */
		close() {
			if( ! this.toggle ) return false;
			if( this.toggle.indexOf('.') !== false ) {
				let el = this.$parent;
				let parts = this.toggle.split('.');
				for (let i = 0; i < parts.length - 1; i++) {
					el = el[parts[i]];
				};
				el[parts[parts.length - 1]] = false;
			}
			else {
				this.$parent[this.toggle] = false
			}
		},

		colorPickerInit() {
			let self = this;
			let colorPickers = self.$el.querySelectorAll('.color-picker');
			if( ! colorPickers.length ) {
				return false;
			}
			var pk = new Piklor(".color-picker", [
	            "#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50", "#f1c40f"
	          , "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6", "#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d"
		        ], {
		            open: ".picker"
		    });

		    pk.colorChosen(color => {
		    	pk.getElm('.picker').style.color = color;
		    	// self.$refs.formgroup.form.color = color.replace('#', '');
		    });
		},

		fillField(name, value) {
			this.$set(this.form, name, value);
		},

		fillData(data) {
			this.reset(data);
		},

		/**
		 * Fill form with values
		 *
		 * @return {[type]}
		 */
		fillInForm() {
			this.form = this.fill;
		},

		focusElement() {
			let self = this;
			if( typeof self.autofocus !== "undefined" && self.$el.getElementsByTagName('input').length ) {
				setTimeout(function() {
					let $el = self.$el.getElementsByTagName('input')[0];
					if( $el && $el.offsetParent !== null ) {
						$el.focus();
					}
				}, 200);
			};
		},

		getData() {
			let data = this.form;
			return data;
			if( ! this.$children.length ) {
				return copyObject(data);
			}

			// get the value of select 2 from children
			for (let i = this.$children.length - 1; i >= 0; i--) {
				let child = this.$children[i];
				if( typeof child['getValue'] === 'undefined' ) continue;
				data[child.name] = child.getValue();
			}

			return copyObject(data);
		},

		getFormData() {
			let form = new FormData();
			let entry = this.form;
			for(let element in entry) {
				if( entry.hasOwnProperty(element) ) {
					let value = entry[element];
					if( value instanceof FileList ) {
						for(let fileIndex in value) {
							if( value.hasOwnProperty(fileIndex) ) {
								form.append(element + '[]', value[fileIndex]);
							}
						}
					}
					else {
						form.append(element, value);
					}
				}
			}

			return form;
		},

		inputChanged(name, value, element) {
			this.$set(this.form, name, value);
			this.$emit('change', this.form);
		},

		inputChangedDebounced: _.debounce(function (name, value) {
			this.$set(this.form, name, value);
			this.$emit('change', this.form);
		}, 20),

		isDependent(element) {
			// return ! element.depend || this.form[element.depend];

			if( ! element.depend ) {
				return true;
			}
			if(typeof element.depend === 'function') {
				return element.depend();
			}
			let form = this.form;
			if( element.depend.indexOf(',') === -1 ) {
				if( element.depend.indexOf(':') !== -1 ) {
					let parts = element.depend.split(':');
					return form[parts[0]] == parts[1].replace('\\"');
				}
				return form[element.depend] ? true : false;
			}
			let valid = true;
			let elements = element.depend.split(',');
			for(let i = elements.length - 1; i >= 0; i--) {
				if(! form[elements[i]]) {
					valid = false;
					break
				}
			}
			return valid;
		},

		getImagePath(index) {
			let self = this;
			let element = self.elements[index];
			let pathName = typeof element.path !== "undefined" ? element.path : 'path';
			let path = dot(pathName, self.form[index]);
			return path;
		},

		/**
		 * Keypad fill
		 *
		 * @param  {[type]} obj
		 * @param  {[type]} name
		 * @return {[type]}
		 */
		keypadFill(obj, name) {
			let self = this;
			let $el = self.$el;
			let btns = $el.getElementsByClassName('act');
			let $fill = ( obj.fill.indexOf('#') >= 0 ) ? document.querySelector(obj.fill) : $el.querySelector('#form-el-' + obj.fill);

			[].map.call(btns, function($btn, i) {
				on($btn, 'click', function() {
					if( $btn.value === 'clear' ) {
						$fill.value = '0';
					} else if($btn.value === 'cancel') {
						self.close();
						return false;
					} else if($btn.value === 'fitted') {
						let val = 0, input = document.querySelector(obj.fitted);
						if( input ) {
							if( input.dataset && typeof input.dataset.value !== "undefined" ) {
								val = input.dataset.value;
								if( val ) val = parseFloat(val).toFixed(2);
							} else {
								val = parseFloat(input.innerText).toFixed(2);
							}
						}

						$fill.value = val || 0;
					} else if( $btn.value === '.' ) {
						if( $fill.value.indexOf('.') === -1 ) {
							$fill.value = $fill.value + '.0';
							self.keypadComma = true;
						}
					} else {
						if( self.keypadComma ) {
							$fill.value = $fill.value.replace('.0', '.' + $btn.value);
							self.keypadComma = null;
						} else {
							$fill.value = ($fill.value == 0) ? $btn.value : $fill.value + '' + $btn.value;
						}
					}

					setTimeout(function() {
						$fill.focus();
						fireEvent($fill, 'change');
					}, 10);
				});
			})
		},

		/**
		 * Reset form
		 *
		 * @return {[type]}
		 */
		reset(data) {
			let self = this;
			self.$el.querySelector('form').reset();
			for (let i = self.$children.length - 1; i >= 0; i--) {
				if( typeof self.$children[i].reset === 'function' ) self.$children[i].reset();
			}

			startTimeout(10, function() {
				data = data ? copyObject(data) : {};
				self.filled = data;
				self.form = data;
				self.isSending = false;

				self.focusElement();

				startTimeout(2, () => {
                    self.$emit('change', self.form);
                })
			});
		},

		/**
		 * Submit form
		 *
		 * @param  {[type]} t
		 * @return {[type]}
		 */
		submitForm(event) {
			let self = this;

			if( ! this.validate(event) ) return false;

			let data = self.form;

			if( self.isFile ) {
				let formD = new FormData();
				for(let field in data) {
					formD.append(field, data[field]);
				}
				data = formD;
			}

			if( ! self.submit ) {
				self.$emit('submit', data, self);
				return true;
			}

			self.isSending = true;
			if( typeof self.submit === "function" ) {
				self.submit(data, self);
			} else {
				self.$parent[self.submit](data, self);
			}
		},

		validate(event, $container) {
			// form.noValidate = true;
			$container = $container || this.$el;

			let required = $container.querySelectorAll('[required]');

			let empty = false;
			[].map.call(required, function($el) {
				if( empty ) return true;
				if( $el.value === '' && $el.offsetParent !== null ) {
					empty = true;
					if( event ) {
						event.preventDefault();
					}
					sendNotify(null, 'Fill out form', 0); // error message
					$el.focus();
					return true;
				}
			});

			if( empty ) {
				return false;
			}

	        // if (!empty && !event.target.checkValidity()) {
	        //     event.preventDefault(); // dismiss the default functionality
	        //     sendNotify(null, Tls.fillOutForm, 0); // error message
	        //     return false;
	        // }

	        return true;
    	},
	},

	render(h) {
		let self = this;
		let elements = self.elements;
		let formBody = [];

		// formElements._instance = this;
		// formElements._h = h;

		if( self.title ) {
			let title = h('h4', { 
				attrs: { class: 'title' },
				domProps: { innerHTML: self.title }
			});
			formBody.push(title);
		}

		if( self.toggle ) {
			let options = h('div', {class: { options: true }},
				[
					h('span', { class: { close: true } }, [
						h('i', {
							class: { 'ex ex-close': true },
							on: { click: function() { self.close(); } }
						})
					])
				]
			);

			formBody.push(options);
		}

		for (let name in elements) {
			if( ! elements.hasOwnProperty(name) ) continue;
			let element = elements[name];
			let className = { group: true };
			if( element.class ) className[element.class] = true;

			let value = self.form[name];
			if(!isValueValid(value)) {
				value = null;
			}
			if( !value && self.filled && self.filled[name] ) {
				value = self.filled[name];
			}

			let group = null;

			let type = element.type || null;

			if( type !== 'checkbox' ) {
				if( element.render ) {
					type = 'div';
				}
				if( ! type ) {
					type = 'input';
				}

				if( type === 'input' || type === 'password' || type === 'number' ) {
					let on = element.on || 'change';
					let listeners = {};
					if( on === 'input' ) {
						listeners[on] = function(e) {
							self.inputChangedDebounced(name, e.target.value);
						}
					}
					else {
						listeners[on] = function(e) {
							self.inputChanged(name, e.target.value);
						}
					}
					if( !isValueValid(value) && element.default ) {
						value = element.default;
					}

					group = h('input', {
						class: { 'input element': true, filled: value, disabled: element.disabled || false },
						on: listeners,
						attrs: {
							type: type,
							name: name,
							autocomplete: 'off',
							disabled: element.disabled || false,
							id: 'form-el-' + name,
							required: element.required || false,
						},
						domProps: {
					    	value: value
					    },
					});
				}
				else if( type === 'textarea' || type === 'text' ) {
					group = h('textarea', {
						class: { 'textarea element': true, filled: value, disabled: element.disabled || false },
						attrs: {
							name: name,
							autocomplete: 'off',
							disabled: element.disabled || false,
							id: 'form-el-' + name,
							required: element.required || false,
							rows: element.rows || null,
						},
						on: { 
							change(e) { 
								self.inputChanged(name, e.target.value);
							}
						},
					}, value || '');
				}
				else if(type === 'calendar') {
					group = h('div', {
						class: { cal: true, selected: value },
						on: {
							change: function(e, r) {
								// console.log(e, r);
							}
						}},
						[
							h('input', {
								attrs: { 
									type: 'input', 
									id: 'form-el-' + name, 
									readonly: true, 
									// placeholder: (element.label||Tls.date)+'...',
									value: value
								},
								class: { input: true },
								on: {
									change: function(e, r) {
										self.inputChanged(name, e.target.value);
									}
								}
							}),
							h('i', {
								class: { 'ex ex-close clear': true },
								on: { 
									click: function() { self.clearCalendarInput('form-el-' + name); },
								}
							}),
							h('app-calendar', {
								props: { attrs: element.attrs, input: 'form-el-' + name },
							})
					]);
				}
				else if(type === 'div') {
					group = h('div', {
						class: { div: true },
						attrs: {
							id: 'form-el-' + name,
						},
						domProps: {
							innerHTML: element.render ? element.render() : ''
						}
					});
				}
				else if( type === 'select' ) {
					let self = this;
					let props = {
						url: element.url,
						// model: element.model,
						model: 'form',
						modelKey: name,
						elements: element.elements,
						elementId: element.elementId,
						elementValue: element.elementValue,
						elementValueFn: element.elementValueFn,
						create: element.create,
						addable: element.addable,
						multiple: element.multiple,
						noClear: element.noClear,
					};

					if( element.attrs ) {
						for (let prop in element.attrs) {
							if( element.attrs.hasOwnProperty( prop ) ) {
								props[prop] = element.attrs[prop];
							} 
						}
					}

					let refName = name.charAt(0).toUpperCase() + toCamel(name.substring(1));

					group = h('app-select', {
						class: { 'select': true, 'selected filled': value },
						attrs: {
							id: 'form-el-' + name,
							placeholder: element.label,
							value: value
						},
						on: {
							change(val) {
								self.inputChanged(name, val);
							},
						},
						props: props,
						ref: 'select' + refName
					});
				}
				else if( type === 'file' ) {
					let fileLabel = h('label', {
						attrs: {
							for: 'form-el-' + name
						}
					});

					let elm = fileLabel.elm;
					let preview = null;
					className['file-group'] = true;

					element.preview = value;

					if( element.preview ) {
						className.preview = true;
						preview = h('div', {
							attrs: {
								class: 'file-preview'
							}
						}, [h('img', {
							attrs: {
								src: element.preview
							}
						})]);
					}

					group = h('div', {
						class: {
							'file': true,
							'is-dragover': element.dragging,
						}
					}, [
						fileLabel,
						preview,
						h('input', {
							attrs: {
								'class': 'input-file input',
								type: 'file',
								name: name,
								autocomplete: 'off',
								disabled: element.disabled || false,
								id: 'form-el-' + name,
								required: element.required || false,
								multiple: element.multiple || false,
								'data-multiple-caption' : '{count} files selected'
							},
							on: {
								drag(e) {
									e.preventDefault();
									e.stopPropagation();
								},
								dragstart(e) {
									e.preventDefault();
									e.stopPropagation();
								},
								dragenter(e) {
									e.preventDefault();
									e.stopPropagation();

									Vue.set(element, 'dragging', true);
								},
								dragend(e) {
									e.preventDefault();
									e.stopPropagation();

									element.dragging = false;
								},
								dragleave(e) {
									e.preventDefault();
									e.stopPropagation();

									element.dragging = false;
								},
								dragover(e) {
									e.preventDefault();
									e.stopPropagation();

									Vue.set(element, 'dragging', true);
								},
								drop(e) {
									e.preventDefault();
									e.stopPropagation();

									element.dragging = false;

									let droppedFiles = e.dataTransfer.files;

									if( ! element.multiple && droppedFiles.length > 1 ) {
										sendNotify('Fehler', 'Es darf nur ein File geuploaded werden.', 0);

										try{
											e.target.value = '';
											if(e.target.value){
												e.target.type = "text";
												e.target.type = "file";
											}
										} catch(e){}
										
										return true;
									}
									
									Vue.set(element, 'files', droppedFiles);

									if( droppedFiles.length > 0 ) {
										element.label = droppedFiles[0].name;
										if(droppedFiles.length > 1) {
											element.label += ' (' + droppedFiles.length + ' Files)';
										}
									}
									self.inputChanged(name, droppedFiles);
									self.isFile = true;

									if( droppedFiles.length && droppedFiles[0].type.substr(0, 6) === 'image/' ) {
										let reader = new FileReader()
										reader.onload = e => {
											let image = e.target.result
											Vue.set(element, 'preview', image);
										}
										reader.readAsDataURL(droppedFiles[0])
									} else {
										element.preview = null;
									}
								},
								change(e) {
									element.dragging = false;

									let droppedFiles = e.target.files;

									if( ! element.multiple && droppedFiles.length > 1 ) {
										droppedFiles = droppedFiles.slice(0, 1);
									}
									
									Vue.set(element, 'files', droppedFiles);

									if( droppedFiles.length > 0 ) {
										element.label = droppedFiles[0].name;
										if(droppedFiles.length > 1) {
											element.label += ' (' + droppedFiles.length + ' Files)';
										}
									}
									self.inputChanged(name, droppedFiles);
									self.isFile = true;

									if( droppedFiles.length && droppedFiles[0].type.substr(0, 6) === 'image/' ) {
										let reader = new FileReader()
										reader.onload = e => {
											let image = e.target.result
											Vue.set(element, 'preview', image);
										}
										reader.readAsDataURL(droppedFiles[0])
									} else {
										element.preview = null;
									}
								}
							}
						})
					])
				}
				else if( type === 'slot' ) {
					group = self.$slots[name];
				}
				else if( type === 'colorpicker' ) {
					//<div class="color-container"><i class="ex ex-circle2 ex-2x picker"></i><div class="color-picker"></div> </div>
					let colors = [];
					for(let color of self.colors) {
						colors.push(h('div', {
							style: {
								backgroundColor: color,
							},
							attrs: {
								'data-color': color
							},
							on: {
								click(e) {
									e.preventDefault();
									e.stopPropagation();
									self.inputChanged(name, e.target.dataset.color);
									Vue.set(element, 'active', false);
								}
							}
						}));
						//`<div data-col="${color}" style="background-color: ${color}"></div>`;
					}
					group = h('div', {
						'class' : {
							'color-container': true,
							active: element.active
						}
					}, [
						h('i', { 
							'class': { 'ex ex-circle2 ex-2x picker': true }, 
							on: {
								click(e) {
									Vue.set(element, 'active', true);
								}
							},
							style: {
								color: value
							}
						}),
						h('div', { 'class': { 'color-picker': true } }, colors)
					]);
				}
				else {
					console.log('type not defined', type);
					continue;
				}
			}


			let style = {};
			if( ! self.isDependent(element) ) {
				style.display = 'none';
			}
			let label = null;
			if( self.labels && (element.type !== 'select' || ! element.type) && element.type !== 'colorpicker' ) {
				let labelBody = [];
				if( element.type === 'checkbox' ) {
					labelBody.push(h('div', {
						class: { 'inline toggler': true, checked: isValueValid(isValueValid) ? true : false },
						attrs: { tabindex: '0' },
						on: {
							keydown(e) {
								if( e.keyCode == 32 ) {
									e.preventDefault();
									self.$set(self.form, name, ! self.form[name]);
								}
							},
							click(e, r) {
								e.stopPropagation();
								if( typeof e.target.checked === 'undefined' ) return false;
								self.$set(self.form, name, ! self.form[name]);
							}
						}
					}, [
						h('input', {
							attrs: {
								id: 'form-el-' + name,
								class: 'hidden',
								type: 'checkbox',
								checked: element.checked
							}
						}),
						h('i', {
							class: {
								'ex ex-1-5x': true,
								'ex-toggle-on active': isValueValid(value),
								'ex-toggle-off': ! isValueValid(value),
							}
						})
					]));
				}

				labelBody.push(h('span', element.label));

				label = h('label', {
					attrs: {
						for: 'form-el-' + name,
					},
					class: {
						checkbox: element.type === 'checkbox',
						label: true
					}
				}, labelBody);
			}
			formBody.push(
				h('div', { style: style, class: className }, [group, label])
			);
		}

		let actionsBody = [self.$slots.actions];
		if (self.submit) {
			actionsBody.push(
				h('button', {
					attrs: { 
						type: 'submit', 
						name: 'form-' + self.name + '-submit',
						id: 'form-' + self.name + '-submit',
						class: 'btn btn-primary btn-sm',
						disabled: self.isSending
					}
				}, self.lang ? self.lang.save : 'Save')
			);
		}
		let actions = h('div', { class: { actions: true } }, actionsBody);
		formBody.push(actions);

		let classes = { form: true, effect: true };
		if( self.classes ) classes[self.classes] = true;
		if( self.hideActions ) classes['hide-actions'] = true;
		let form = h('form', {
			class: classes,
			attrs: { target: self.target, autocomplete: 'off' },
			on: {
				keydown(e) {
					if (!self.submit && e.keyCode && e.keyCode === 13 && (!document.activeElement || document.activeElement.nodeName !== 'TEXTAREA')) {
						self.submitForm(e);
					}
				},
				submit(e) {
					e.preventDefault();
					self.submitForm(e);
				}
			}
		}, formBody);

		return h('div', [form]);
	}
}
</script>