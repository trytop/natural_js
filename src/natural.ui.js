/*!
 * Natural-UI v0.8.4.14
 * bbalganjjm@gmail.com
 *
 * Copyright 2014 KIM HWANG MAN
 * Released under the LGPL license
 *
 * Date: 2014-09-26T11:11Z
 */
(function(window, $) {
	var version = "0.8.4.14";

	// N local variables
	$.fn.extend(N, {
		"Natural-UI" : version
	});

	N.fn = N.prototype = {
		constructor : N,
		alert : function(msg, vars) {
			return new N.alert(this, msg, vars);
		},
		button : function(opts) {
			if(this.is("input[type='button'], button, a")) {
				return this.each(function() {
					return new N.button(N(this), opts);
				});
			}
		},
		select : function(opts) {
			return new N.select(this, opts);
		},
		form : function(opts) {
			return new N.form(this, opts);
		},
		grid : function(opts) {
			return new N.grid(this, opts);
		},
		popup : function(opts) {
			return new N.popup(this, opts);
		},
		tab : function(opts) {
			return new N.tab(this, opts);
		},
		datepicker : function(opts) {
			return new N.datepicker(this, opts);
		}
	};
	$.fn.extend(N.fn);

	(function(N) {

		// Alert(Confirm)
		var Alert = N.alert = function(obj, msg, vars) {
			this.options = {
				obj : obj,
				context : obj,
				container : null,
				msgContext : N(),
				msgContents : null,
				msg : msg,
				vars : vars,
				width : 0,
		        height : 0,
				isInput : false,
				isWindow : obj.get(0) === window || obj.get(0) === window.document,
				title : obj.get(0) === window || obj.get(0) === window.document ? undefined : obj.attr("title"),
				button : true,
				closeMode : "remove", // closeMode : hide : keep element, remove : remove element
				modal : true,
				onOk : null,
				onCancel : null,
				overlayColor : null,
				"confirm" : false,
				alwaysOnTop : false,
				dynPos : true // dynamic positioning for massage context and message overlay
			};

			try {
				this.options.container = N.context.attr("architecture").page.context;
				this.options = $.extend({}, this.options, N.context.attr("ui").alert);
				this.options.container = N(this.options.container);
			} catch (e) {
				N.error("[N.alert]" + e, e);
			}

			if (obj.is(":input")) {
				this.options.isInput = true;
			}
			if(msg !== undefined && N.isPlainObject(msg)) {
				$.extend(this.options, msg);
			}

			if(this.options.isWindow) {
				this.options.context = N("body");
			}

			if (!this.options.isInput) {
				Alert.wrapEle.call(this);
			} else {
				Alert.wrapInputEle.call(this);
			}

			this.options.context.instance("alert", this);

			return this;
		};

		Alert.fn = Alert.prototype;
		$.extend(Alert.fn, {
			"context" : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			"show" : function() {
				var opts = this.options;
				var this_ = this;

				if (!opts.isInput) {
					Alert.resetOffSetEle(opts);
					var position = opts.context.position();
					if(opts.dynPos && !opts.isWindow) {
						opts.time = setInterval(function() {
							if(opts.context.outerWidth() > 0) {
								Alert.resetOffSetEle(opts);
							} else {
								// for the page change
								clearInterval(opts.time);
							}
						}, 500);
					}
				} else {
					if (!N.isEmptyObject(opts.msg)) {
						opts.context.parent().css({
							"white-space": "normal"
						});
						opts.msgContext.fadeIn(150, function() {
							opts.iTime = setTimeout(function() {
								clearTimeout(opts.iTime);
								opts.context.parent().css({
									"white-space": ""
								});
								this_[opts.closeMode]();
							}, opts.input.displayTimeout);
						});
					}
				}

				// bind "ESC" key event
				// if press the "ESC" key, alert dialog will be removed
				opts.onKeyup = function(e) {
		        	if (e.keyCode == 27) {
		        		this_[opts.closeMode]();
		        	}
				};
		        $(document).bind("keyup.alert", opts.onKeyup);

				return this;
			},
			"hide" : function() {
				var opts = this.options;
				if (!opts.isInput) {
					clearInterval(opts.time);
					opts.msgContext.hide();
					opts.msgContents.hide();
				} else {
					clearTimeout(opts.iTime);
					opts.msgContext.remove();
				}

				$(document).unbind("keyup.alert", opts.onKeyup);
				return this;
			},
			"remove" : function() {
				var opts = this.options;
				if (!opts.isInput) {
					clearInterval(opts.time);
					opts.msgContext.remove();
					opts.msgContents.remove();
				} else {
					clearTimeout(opts.iTime);
					opts.msgContext.remove();
				}

				$(document).unbind("keyup.alert", opts.onKeyup);
				return this;
			}
		});

		$.extend(Alert, {
			wrapEle : function() {
				var opts = this.options;

				// set style message overlay
				var blockOverlayCss = {
					"display" : "none",
					"position" : opts.isWindow ? "fixed" : "absolute",
					"cursor" : "not-allowed",
					"padding" : 0
				};

				if(!opts.isWindow) {
					blockOverlayCss["border-radius"] = opts.context.css("border-radius") != "0px" ? opts.context.css("border-radius") : "0px";
				}

				var maxZindex = 0;
				if(opts.alwaysOnTop) {
					// get max index among page elements
					maxZindex = N.element.maxZindex(opts.container.find("div, span, ul, p"));
					blockOverlayCss["z-index"] = String(maxZindex + 1);
				}

				if (opts.overlayColor !== null) {
					blockOverlayCss["background-color"] = opts.overlayColor;
				}

				// make message overlay
				opts.msgContext = opts.container.append($('<div class="block_overlay__" onselectstart="return false;"></div>')
						.css(blockOverlayCss)).find("div.block_overlay__:last");
				if (opts.vars !== undefined) {
					opts.msg = N.message.replaceMsgVars(opts.msg, opts.vars);
				}

				// set style message box
				var blockOverlayMsgCss = {
					"display" : "none",
					"position" : "absolute"
				};

				if(opts.alwaysOnTop) {
					blockOverlayMsgCss["z-index"] = String(maxZindex + 2);
				}

				// set title
				var titleBox = '';
				if(opts.title !== undefined) {
					titleBox = '<li class="msg_title_box__">' + opts.title + '</li>';
				}

				// set button box
				var buttonBox = '';
				if(opts.button) {
					buttonBox = '<li class="buttonBox__">' +
						'<a href="#" class="confirm__">' + N.message.get(opts.message, "confirm") + '</a>' +
						'<a href="#" class="cancel__">' + N.message.get(opts.message, "cancel") + '</a>' +
						'</li>';
				}

				// make message box
				opts.msgContents = opts.msgContext.after(
						$('<span class="block_overlay_msg__"><ul>'
								+ titleBox
								+ '<li class="msg_box__"></li>'
								+ buttonBox
								+ '</ul></span>').css(blockOverlayMsgCss)).next("span.block_overlay_msg__:last");

				// set message
				opts.msgContents.find("li.msg_box__").html(opts.msg);

				// set width
				if(opts.width > 0) {
					opts.msgContents.find("li.msg_box__").width(opts.width);
				}

				// set height
				if(opts.height > 0) {
					opts.msgContents.find("li.msg_box__").height(opts.height);
					opts.msgContents.find("li.msg_box__").css("overflow-y", "auto");
				}

				var this_ = this;
				//set confirm button style and bind click event
				opts.msgContents.find("li.buttonBox__ a.confirm__").button(opts.global.okBtnStyle);
				opts.msgContents.find("li.buttonBox__ a.confirm__").click(function(e) {
					e.preventDefault();
					if (opts.onOk !== null) {
						opts.onOk.call(this_, opts.msgContext, opts.msgContents);
					}
					this_[opts.closeMode]();
				});

				// remove modal overlay layer for (opts.modal = false)
				if(!opts.modal) {
					opts.msgContext.remove();
				}

				// set cancel button style and bind click event
				if(opts.confirm) {
					opts.msgContents.find("li.buttonBox__ a.cancel__").button(opts.global.cancelBtnStyle);
					opts.msgContents.find("li.buttonBox__ a.cancel__").click(function(e) {
						e.preventDefault();
						if (opts.onCancel !== null) {
							opts.onCancel(opts.msgContext, opts.msgContents);
						}
						this_[opts.closeMode]();
					});
				} else {
					opts.msgContents.find("a.cancel__").remove();
				}
			},
			resetOffSetEle : function(opts) {
				var position = opts.context.position();
				if(opts.context.outerWidth() > 0 && ((position.top > 0 && position.left > 0) || opts.isWindow)) {
					var context = opts.context;
					var msgContext = opts.msgContext;
					// reset message context(overlay) position
					opts.msgContext.css({
						"top" : opts.isWindow ? 0 : position.top + "px",
						"left" : opts.isWindow ? 0 : position.left + "px",
						"height" : opts.isWindow ? N(window.document).height() : opts.context.outerHeight() + "px",
						"width" : opts.isWindow ? N(window.document).width() : opts.context.outerWidth() + "px"
					}).hide().show();
					// reset message contents position
					var msgContentsCss = {
						"top" : (((opts.isWindow ? N(opts.obj).height() : opts.msgContext.height()) / 2 + position.top) - opts.msgContents.height() / 2) + "px",
						"left" : ((opts.msgContext.width() / 2 + position.left) - parseInt(opts.msgContents.width() / 2)) + "px"
					};
					if(opts.isWindow) {
						msgContentsCss.position = "fixed";
					}
					opts.msgContents.css(msgContentsCss).show();
				} else {
					// for non-active tab
					opts.msgContext.hide();
					opts.msgContents.hide();
				}
			},
			wrapInputEle : function() {
				var opts = this.options;

				if(opts.context.instance("alert") !== undefined) {
					opts.context.instance("alert").remove();
				}
				opts.msgContext = opts.context.next("span.msg__");
				if (opts.msgContext.length == 0) {
					opts.msgContext = opts.context.after('<span class="msg__" style="display: none;"><ul class="msg_line_box__"></ul></span>').next("span.msg__");
					opts.msgContext.append('<a href="#" class="msg_close__"></a>');
				}
				if(opts.alwaysOnTop) {
					opts.msgContext.css("z-index", N.element.maxZindex(opts.container.find("div, span, ul, p")) + 1);
				}

				if (N.isEmptyObject(opts.msg)) {
					this.remove();
				}

				var this_ = this;
				opts.msgContext.find("a.msg_close__").click(function(e) {
					e.preventDefault();
					this_.remove();
				});

				var ul_ = opts.msgContext.find("ul.msg_line_box__");
				if (N.isArray(opts.msg)) {
					opts.msgContext.find("ul.msg_line_box__").empty();
					$(opts.msg).each(function(i, msg_) {
						if (opts.vars !== undefined) {
							opts.msg[i] = N.message.replaceMsgVars(msg_, opts.vars);
						}
						ul_.append('<li>' + opts.msg[i] + '</li>');
					});
				} else {
					if (opts.vars !== undefined) {
						opts.msg = N.message.replaceMsgVars(msg, opts.vars);
					}
					ul_.append('<li>' + opts.msg + '</li>');
				}
			}
		});

		// Button
		var Button = N.button = function(obj, opts) {
			this.options = {
				context : obj,
				size : "medium", // size : smaller, small, medium, large, big
				color : "white", // color : white, blue, skyblue, gray
				disable : false,
				effect : true
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui")["button"]);
			} catch (e) {
				N.error("[N.button]" + e, e);
			}
			$.extend(this.options, N.element.toOpts(this.options.context));
			if(opts !== undefined) {
				$.extend(this.options, opts);
			}

			Button.wrapEle.call(this);

			this.options.context.instance("button", this);

			return this;
		};

		Button.fn = Button.prototype;
		$.extend(Button.fn, {
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			disable : function() {
				var context = this.options.context;
				// fade effect
				if(this.options.effect) {
					context.fadeTo(150, "0.6");
				} else {
					context.css("opacity", "0.6");
				}
		        if (context.is("a")) {
		        	context.unbind("click.button");
		            context.tpBind("click.button", N.element.disable);
		        } else {
		            context.prop("disabled", true);
		        }
		        context.addClass("disabled");
				return this;
			},
			enable : function() {
				var context = this.options.context;
				// fade effect
				if(this.options.effect) {
					context.fadeTo(150, "1");
				} else {
					context.css("opacity", "1");
				}
		        if (context.is("a")) {
		            context.unbind("click", N.element.disable);
		        } else {
		            context.prop("disabled", false);
		        }
		        context.removeClass("disabled");
				return this;
			}
		});

		$.extend(Button, {
			wrapEle : function() {
				var opts = this.options;

				if(opts.disable) {
					this.disable();
				} else {
					this.enable();
				}

				if(opts.context.is("a")) {
					opts.context.attr("onselectstart", "return false;");
	            }
		        if (opts.context.is("a") || opts.context.is("button") || opts.context.is("input[type='button']")) {
		        	opts.context.removeClass("btn_common__ btn_white__ btn_blue__ btn_skyblue__ btn_gray__ btn_smaller__ btn_small__ btn_medium__ btn_large__ btn_big__");
	                opts.context.addClass("btn_common__ btn_" + opts.color + "__ btn_" + opts.size + "__");

	                // for ie8
	                if(N.browser.msieVersion() === 8 && opts.context.is("a")) {
	                	opts.context.css("line-height", "");
	                	if(opts.size === "smaller") {
	                		opts.context.css("line-height", "17px");
	                	} else if(opts.size === "small") {
	                		opts.context.css("line-height", "21px");
	                	} else if(opts.size === "medium") {
	                		opts.context.css("line-height", "26px");
	                	} else if(opts.size === "large") {
	                		opts.context.css("line-height", "34px");
	                	} else if(opts.size === "big") {
	                		opts.context.css("line-height", "48px");
	                	}
	                }

	                if(N.browser.msieVersion() === 9) {
	                	if(opts.context.is("a")) {
	                		opts.context.css("line-height", "");
	                	}
            			opts.context.css("line-height", (parseInt(opts.context.css("line-height")) - 3) + "px");
            		}

	                opts.context.unbind("mouseover.button mousedown.button mouseup.button mouseout.button");
	                opts.context.bind("mouseover.button", function() {
	                    if (!opts.context.hasClass("disabled")) {
	                    	if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 8) {
	                    		$(this).css("box-shadow", "rgba(0, 0, 0, 0.2) 1px 1px 1px inset");
	                    	} else {
	                    		// fade effect
	                    		if(opts.effect) {
	                    			$(this).fadeTo(100, "0.9");
	            				} else {
	            					$(this).css("opacity", "0.9");
	            				}
	                    	}
	                    }
	                });
	                opts.context.bind("mousedown.button", function() {
	                    if (!opts.context.hasClass("disabled")) {
	                    	if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 8) {
	                    		$(this).css("box-shadow", "rgba(0, 0, 0, 0.2) 3px 3px 3px inset");
	                    	} else {
	                    		// fade effect
	                    		if(opts.effect) {
	                    			$(this).fadeTo(100, "0.7");
	            				} else {
	            					$(this).css("opacity", "0.7");
	            				}
	                    	}
	                    }
	                });
	                opts.context.bind("mouseup.button", function() {
	                    if (!opts.context.hasClass("disabled")) {
	                    	if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 8) {
	                    		$(this).css("box-shadow", "none");
	                    	} else {
	                    		// fade effect
	                    		if(opts.effect) {
	                    			$(this).fadeTo(100, "1");
	            				} else {
	            					$(this).css("opacity", "1");
	            				}
	                    	}
	                    }
	                });
	                opts.context.bind("mouseout.button", function() {
	                    if (!opts.context.hasClass("disabled")) {
	                    	if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 8) {
	                    		$(this).css("box-shadow", "none");
	                    	} else {
	                    		// fade effect
	                    		if(opts.effect) {
	                    			$(this).fadeTo(100, "1");
	            				} else {
	            					$(this).css("opacity", "1");
	            				}
	                    	}
	                    }
	                });
	            }
			}
		});

		// DatePicker
		var DatePicker = N.datepicker = function(obj, opts) {
			this.options = {
				context : obj,
				contents : $('<div class="datepicker__"></div>'),
				monthonly : false,
				focusin : true,
				onSelect : null,
				onBeforeShow : null,
				onBeforeHide : null
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui")["datepicker"]);
			} catch (e) {
				N.error("[N.datepicker]" + e, e);
			}

			if(opts !== undefined) {
				$.extend(this.options, opts);
			}

			this.options.context.addClass("datepicker__");

			DatePicker.wrapEle.call(this);

			this.options.context.instance("datepicker", this);
		};

		DatePicker.fn = DatePicker.prototype;
		$.extend(DatePicker.fn, {
			show : function() {
				var opts = this.options;

				// auto select datepicker items from before input value
				if(!N.string.isEmpty(opts.context.val())) {
					DatePicker.selectItems(opts,
							opts.context.val().replace(/[^0-9]/g, ""),
							(!opts.monthonly ? N.context.attr("data").formatter.date.Ymd() : N.context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, ""),
							opts.contents.find("div.datepicker_years_panel__"),
							opts.contents.find("div.datepicker_months_panel__"),
							opts.contents.find("div.datepicker_days_panel__"));
				}

				if(opts.onBeforeShow !== null) {
					var result = opts.onBeforeShow.call(this, opts.context, opts.contents);
					if(result !== undefined && result === false) {
						return this;
					};
				}

				var this_ = this;

				opts.contents.fadeIn(150);

				// bind "ESC" key event
				// if press the "ESC" key, datepicker will be hidden
		        $(document).bind("keyup.datepicker", function(e) {
		        	if (e.keyCode == 27) {
		        		this_.hide();
		        	}
				});

		        // lock for when the click datepicker panel
		        // prevent blur event of opts.context
		        var lock;
	        	$(window.document).bind("mousedown.datepicker", function(e) {
	        		if($(e.target).closest(opts.contents).length > 0) {
	        			lock = true;
					} else {
						lock = false;
					}
	        	});

		        // when the context(input) is focused out, close the datepicker panel
		        opts.context.bind("blur.datepicker", function() {
		        	if(!lock) {
		        		this_.hide();
		        	}
		        });

		        // set datapicker position
				$(window).bind("resize.datepicker", function() {
					var leftOfs = opts.context.position().left;
					var parentEle = opts.contents.closest("tbody.form__");
					var limitWidth;
					if(parentEle.length > 0) {
						limitWidth = parentEle.position().left + parentEle.width();
					} else {
						limitWidth = $(window).width();
					}
					if(leftOfs + opts.contents.width() > limitWidth) {
						opts.contents.css("right", (limitWidth - (leftOfs + opts.context.outerWidth())) + "px");
					} else {
						opts.contents.css("left", leftOfs + "px");
					}
				}).trigger("resize.datepicker");

				return this;
			},
			hide : function() {
				var opts = this.options;

				if(opts.onBeforeHide !== null) {
					var result = opts.onBeforeHide.call(this, opts.context, opts.contents);
					if(result !== undefined && result === false) {
						return this;
					};
				}

				$(window.document).unbind("mousedown.datepicker");
				opts.context.unbind("blur.datepicker");
				$(window.document).unbind("keyup.datepicker");
				$(window).unbind("resize.datepicker");
				opts.contents.fadeOut(150);
				opts.context.get(0).blur();
				return this;
			}
		});

		$.extend(DatePicker, {
			context : function() {
				return this.options.context;
			},
			wrapEle : function() {
				var opts = this.options;
				var this_ = this;

				var d = new Date();
				var currYear = parseInt(d.formatDate("Y"));
				var format = (!opts.monthonly ? N.context.attr("data").formatter.date.Ymd() : N.context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, "");

				opts.contents = $('<div class="datepicker_contents__"></div>');
				if(opts.monthonly) {
					opts.context.attr("maxlength", "6");
					opts.contents.addClass("datepicker_monthonly__");
				} else {
					opts.context.attr("maxlength", "8");
				}
				opts.contents.css({
					display: "none",
					position: "absolute"
				});

				// create year items
				var yearsPanel = $('<div class="datepicker_years_panel__"></div>');
				yearsPanel.css({
					"width": "40px",
					"float": "left"
				});
				var yearItem = $('<div align="center"></div>');
				yearItem.css({
					"line-height": "25px"
				}).click(function(e) {
					e.preventDefault();
					yearsPanel.find("div.datepicker_year_item__").removeClass("datepicker_year_selected__");
					$(this).addClass("datepicker_year_selected__");
				});
				var yearItemClone;
				yearsPanel.append(yearItem.clone(true).addClass("datepicker_year_title__").text(N.message.get(opts.message, "year")));
				// render year items
				for(var i=currYear-2;i<=currYear+2;i++) {
					yearItemClone = yearItem.clone(true).addClass("datepicker_year_item__");
					if(i === currYear) {
						yearItemClone.addClass("datepicker_curr_year__");
						yearItemClone.addClass("datepicker_year_selected__");
					}
					yearsPanel.append(yearItemClone.text(String(i)));
				}

				var yearPaging = $('<div class="datepicker_year_paging__" align="center"><a href="#" class="datepicker_year_prev__" title="이전">◀</a> <a href="#" class="datepicker_year_next__" title="다음">▶</a></div>');
				yearPaging.css({
					"line-height": "25px"
				});
				yearPaging.find("a.datepicker_year_prev__").click(function(e) {
					e.preventDefault();
					DatePicker.yearPaging(yearsPanel.find("div.datepicker_year_item__"), currYear, -5);
				});
				yearPaging.find("a.datepicker_year_next__").click(function(e) {
					e.preventDefault();
					DatePicker.yearPaging(yearsPanel.find("div.datepicker_year_item__"), currYear, 5);
				});
				yearsPanel.append(yearPaging);
				opts.contents.append(yearsPanel);

				// create month items
				var monthsPanel = $('<div class="datepicker_months_panel__"></div>');
				monthsPanel.css({
					"width": "60px",
					"float": "left",
					"margin-left": "3px"
				});
				var monthItem = $('<div align="center"></div>');
				var gEndDate;
				monthItem.css({
					"line-height": "25px",
					"width": "28px",
					"float": "left"
				}).click(function(e) {
					e.preventDefault();
					monthsPanel.find("div.datepicker_month_item__").removeClass("datepicker_month_selected__");
					$(this).addClass("datepicker_month_selected__");
					if(opts.monthonly) {
						var selDate = N.date.strToDate(N.string.lpad(yearsPanel.find("div.datepicker_year_selected__").text(), 4, "0") + N.string.lpad($(this).text(), 2, "0"), "Ym");
						// set date format of global config
						selDate.format = N.context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");

						var onSelectContinue;
						if(opts.onSelect !== null) {
							onSelectContinue = opts.onSelect.call(this, opts.context, selDate, opts.monthonly);
						}
						if(onSelectContinue === undefined || onSelectContinue === true) {
							opts.context.val(selDate.obj.formatDate(selDate.format.replace(/[^Y|^m|^d]/g, "")));
						}
						this_.hide();
					} else {
						daysPanel.empty();
						var endDateCls = N.date.strToDate(N.string.lpad(yearsPanel.find("div.datepicker_year_selected__").text(), 4, "0") +  N.string.lpad(String(parseInt($(this).text())+1), 2, "0") + "00", "Ymd");
						var endDate = gEndDate = endDateCls.obj.getDate();
						if(format !== "Ymd") {
							gEndDate = 31;
						}
						endDateCls.obj.setDate(1);
						var startDay = endDateCls.obj.getDay();
						//render week
						for(var i=0;i<days.length;i++) {
							daysPanel.append(dayItem.clone().addClass("datepicker_day__").text(days[i]));
						}

						var prevEndDateCls = N.date.strToDate(N.string.lpad(yearsPanel.find("div.datepicker_year_selected__").text(), 4, "0") +  N.string.lpad($(this).text(), 2, "0") + "00", "Ymd");
						var prevEndDate = prevEndDateCls.obj.getDate();
						var date;
						var dateItem;
						//render date items
						for(var i=1-startDay;i<=42-startDay;i++) {
							date = String(i);
							dateItem = dayItem.clone(true);
							if(i<=0) {
								dateItem.addClass("datepicker_prev_day_item__");
								date = String(prevEndDate + i);
							} else if(i > endDate) {
								dateItem.addClass("datepicker_next_day_item__");
								date = String(i-endDate);
							} else {
								dateItem.addClass("datepicker_day_item__");
							}
							daysPanel.append(dateItem.text(date));
						}

						if(daysPanel.find("div.datepicker_day_item__.datepicker_day_selected__").length === 0) {
							daysPanel.find("div.datepicker_day_item__:contains(" + String(parseInt(d.formatDate("d"))) + "):eq(0)").addClass("datepicker_day_selected__");
						}
					}
				});
				monthsPanel.append(monthItem.clone().css("width", "58px").addClass("datepicker_month_title__").text(N.message.get(opts.message, "month")));

				// render month items
				for(var i=1;i<=12;i++) {
					monthsPanel.append(monthItem.clone(true).addClass("datepicker_month_item__").text(String(i)));
					if(monthsPanel.find("div.datepicker_month_item__ .datepicker_month_selected__").length === 0) {
						monthsPanel.find("div.datepicker_month_item__:contains(" + String(parseInt(d.formatDate("m"))) + "):eq(0)").addClass("datepicker_month_selected__");
					}
				}
				opts.contents.append(monthsPanel);

				if(!opts.monthonly) {
					// create day items
					var days = N.message.get(opts.message, "days").split(",");
					var daysPanel = $('<div class="datepicker_days_panel__"></div>');
					daysPanel.css({
						"width": "210px",
						"float": "left",
						"margin-left": "3px"
					});
					var dayItem = $('<div align="center"></div>');
					dayItem.css({
						"line-height": "25px",
						"width": "28px",
						"float": "left"
					}).click(function(e) {
						e.preventDefault();
						var thisEle = $(this);
						daysPanel.find("div.datepicker_prev_day_item__, div.datepicker_day_item__, div.datepicker_next_day_item__").removeClass("datepicker_day_selected__");
						thisEle.addClass("datepicker_day_selected__");
						var selMonth;
						if(thisEle.hasClass("datepicker_prev_day_item__")) {
							selMonth = String(parseInt(monthsPanel.find("div.datepicker_month_selected__").text()) - 1);
						} else if(thisEle.hasClass("datepicker_next_day_item__")) {
							selMonth = String(parseInt(monthsPanel.find("div.datepicker_month_selected__").text()) + 1);
						} else {
							selMonth = monthsPanel.find("div.datepicker_month_selected__").text();
						}
						var selDate = N.date.strToDate(N.string.lpad(yearsPanel.find("div.datepicker_year_selected__").text(), 4, "0")
								+ N.string.lpad(selMonth, 2, "0")
								+ N.string.lpad(thisEle.text(), 2, "0"), "Ymd");
						// set date format of global config
						selDate.format = N.context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");

						var onSelectContinue;
						if(opts.onSelect !== null) {
							onSelectContinue = opts.onSelect.call(this, opts.context, selDate, opts.monthonly);
						}
						if(onSelectContinue === undefined || onSelectContinue === true) {
							opts.context.val(selDate.obj.formatDate(selDate.format.replace(/[^Y|^m|^d]/g, "")));
						}
						this_.hide();
					});
					opts.contents.append(daysPanel);

					// click current month
					monthsPanel.find("div.datepicker_month_item__:contains(" + String(parseInt(d.formatDate("m"))) + ")").click();
				}

				// append datepicker panel after context
				opts.context.after(opts.contents);

				// bind focusin event
				if(opts.focusin) {
					opts.context.bind("focusin.datepicker", function() {
						if(!opts.contents.is(":visible")) {
							this_.show();
						}
					});
				}

				// bind key event
				opts.context.bind("keyup.datepicker", function(e) {
					e.preventDefault();
					var value = opts.context.val().replace(/[^0-9]/g, "");

					// when press the number keys
					if (e.keyCode >= 48 && e.keyCode <= 57 && value.length <= 8 && value.length%2 === 0) {
		        		var dateStrArr = N.date.strToDateStrArr(value, format);
		        		var dateStrStrArr = N.date.strToDateStrArr(value, format, true);

        				// validate input value
	        			if(!isNaN(dateStrArr[0]) && dateStrStrArr[0].length === 4 && dateStrArr[0] < 100) {
        					opts.context.alert(N.message.get(opts.message, "yearNaN")).show();
    						opts.context.val(value.replace(dateStrStrArr[0], ""));
        					return false;
        				} else if(!isNaN(dateStrArr[1]) && dateStrStrArr[1].length === 2 && (dateStrArr[1] < 1 || dateStrArr[1] > 12)) {
        					opts.context.alert(N.message.get(opts.message, "monthNaN")).show();
    						opts.context.val(value.replace(dateStrStrArr[1], ""));
        					return false;
        				} else if(!opts.monthonly && !isNaN(dateStrArr[2]) && dateStrStrArr[2].length === 2 && (dateStrArr[2] < 1 || dateStrArr[2] > parseInt(gEndDate))) {
        					opts.context.alert(N.message.get(opts.message, "dayNaN", [String(parseInt(gEndDate))])).show();
    						opts.context.val(value.replace(dateStrStrArr[2], ""));
        					return false;
        				}
	        			if((format.length === 3 && format.indexOf("md") > -1) || format.length === 2) {
	        				DatePicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
	        			} else {
	        				if(!opts.monthonly) {
	        					if(value.length === 8) {
	        						DatePicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
	        					}
	        				} else {
	        					if(value.length === 6) {
	        						DatePicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
	        					}
	        				}
	        			}

	        		// when press the enter key
					} else if (e.keyCode == 13) {
		        		if(!opts.monthonly) {
		        			daysPanel.find("div.datepicker_day_selected__").click();
		        		} else {
		        			monthsPanel.find("div.datepicker_month_selected__").click();
		        		}

		        		// Temporary measures, I dont't know why into formated data to only data set of memory when press the enter key
		        		if(!N.string.isEmpty(value)) {
		        			opts.context.val(value).focusout();
		        		}
		        	}
				});
			},
			yearPaging : function(yearItems, currYear, addCnt, absolute) {
				// Date Object's year value must be greater 2 digits
				yearItems.removeClass("datepicker_curr_year__");
				var thisEle;
				var yearNum;
				yearItems.each(function(i) {
					thisEle = $(this);
					if(absolute !== undefined && absolute === true) {
						yearNum = parseInt(currYear) + i;
					} else {
						yearNum = parseInt(thisEle.text());
					}
					if(yearNum <= 100 - addCnt) {
						thisEle.text(100 + i);
					} else {
						thisEle.text(String(yearNum + addCnt));
					}
					if(thisEle.text() === String(currYear)) {
						thisEle.addClass("datepicker_curr_year__");
					}
				});
			},
			selectItems : function(opts, value, format, yearsPanel, monthsPanel, daysPanel) {
				var dateStrArr = N.date.strToDateStrArr(value, format);
        		var dateStrStrArr = N.date.strToDateStrArr(value, format, true);

				// year item selection
    			if(!isNaN(dateStrStrArr[0]) && dateStrStrArr[0].length === 4) {
    				yearsPanel.find("div.datepicker_year_item__").removeClass("datepicker_year_selected__");
					DatePicker.yearPaging(yearsPanel.find("div.datepicker_year_item__"), dateStrArr[0], -2, true);
					yearsPanel.find("div.datepicker_year_item__:contains('" + String(dateStrArr[0]) + "')").click();
    			}
    			// month item selection
    			if(!isNaN(dateStrStrArr[1]) && dateStrStrArr[1].length === 2) {
					monthsPanel.find("div.datepicker_month_item__").removeClass("datepicker_month_selected__");
					if(!opts.monthonly) {
						monthsPanel.find("div.datepicker_month_item__:contains(" + String(dateStrArr[1]) + "):eq(0)").click();
					} else {
						monthsPanel.find("div.datepicker_month_item__:contains(" + String(dateStrArr[1]) + "):eq(0)").addClass("datepicker_month_selected__");
					}
				}
    			// day item selection
    			if(!isNaN(dateStrStrArr[2]) && dateStrStrArr[2].length === 2) {
					daysPanel.find("div.datepicker_prev_day_item__, div.datepicker_day_item__, div.datepicker_next_day_item__").removeClass("datepicker_day_selected__");
					daysPanel.find("div.datepicker_day_item__:contains(" + String(dateStrArr[2]) + "):eq(0)").addClass("datepicker_day_selected__");
				}
			}
		});


		// Popup
		var Popup = N.popup = function(obj, opts) {
			//TODO think more whether "onLoad event" needs or not
			this.options = {
				context : obj,
				url : null,
				title : null,
				button : true,
				modal : true,
				height : 0,
				width : 0,
				closeMode : "hide",
				alwaysOnTop : false,
				"confirm" : true,
				onOk : null,
				onCancel : null,
				onOpen : null,
				onOpenData : null,
				onClose : null,
				onCloseData : null,
				preload : false
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui")["popup"]);
			} catch (e) {
				N.error("[N.popup]" + e, e);
			}

			if(opts !== undefined) {
				if(N.type(opts) === "string") {
					this.options.url = opts;
				} else {
					if(arguments.length === 1 && N.isPlainObject(obj)) {
						$.extend(this.options, obj);
					} else {
						$.extend(this.options, opts);
					}
					if(N.type(this.options.context) === "string") {
						this.options.context = N(this.options.context);
					}
				}
			}

			//set opener(parent page's Controller)
			try {
				var viewContext = arguments.callee.caller.arguments.callee.caller.arguments[0];
				if(viewContext.instance !== undefined) {
					this.opener = viewContext.instance("cont");
				} else {
					this.opener = $(viewContext.target).closest(".view_context__").instance("cont");
				}
			} catch(e) {
				if(this.options.url !== null) {
					N.warn("[N.popup][" + e + "] Don't set opener object in popup's Controller")
				}
			}

			if(this.options.url !== null) {
				if(this.options.preload) {
					Popup.loadEle.call(this, function(context) {
						// this callback function is for async page load
						this.options.context = context;
						this.options.context.instance("popup", this);
					});
				}
			} else {
				Popup.wrapEle.call(this);
				this.options.context.instance("popup", this);
			}

	        return this;
		};

		Popup.fn = Popup.prototype;
		$.extend(Popup.fn, {
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			open : function(onOpenData) {
				var opts = this.options;
				var this_ = this;

				if(this.options.url !== null && !opts.preload) {
					Popup.loadEle.call(this, function(context) {
						// this callback function is for async page load
						opts.context = context;
						opts.context.instance("popup", this);

						Popup.popOpen.call(this_, onOpenData);
					});
					opts.preload = true;
				} else {
					Popup.popOpen.call(this, onOpenData);
				}
				return this;
			},
			close : function(onCloseData) {
				var opts = this.options;

				// "onClose" event execute
				if(opts.onClose !== null) {
					if(onCloseData !== undefined) {
						opts.onCloseData = onCloseData;
					}
					opts.onClose.call(this, opts.onCloseData);
				}
				this.alert.hide();
				return this;
			},
			changeEvent : function(name, callback) {
				this.options[name] = callback;
				this.alert.options[name] = this.options[name];
			},
			remove : function() {
				this.alert.remove();
				return this;
			}
		});

		$.extend(Popup, {
			wrapEle : function() {
				var opts = this.options;
				opts.context.hide();

				// use alert
				// opts.context is alert message
				opts.msg = opts.context;
				if(opts.title === null) {
					opts.title = opts.context.attr("title");
					opts.context.removeAttr("title");
				}

				this.alert = N(window).alert(opts);
				this.alert.options.msgContext.addClass("popup_overlay__");
				this.alert.options.msgContents.addClass("popup__");
			},
			loadEle : function(callback) {
				var opts = this.options;
				var this_ = this;

				// TODO show loading bar
				N.comm({
					url : opts.url,
					contentType : "application/x-www-form-urlencoded",
					dataType : "html"
				}).submit(function(page) {
					// set loaded page instance to options.context
					opts.context = $(page);

					// set title
					if(opts.title === null) {
						opts.title = opts.context.attr("title");
						opts.context.removeAttr("title");
					}

					// opts.context is alert message;
					opts.msg = opts.context;
					this_.alert = N(window).alert(opts);
					this_.alert.options.msgContext.addClass("popup_overlay__");
					this_.alert.options.msgContents.addClass("popup__");

					var sc = opts.context.instance("cont");

					// set popup instance to popup's Controller
					if(sc !== undefined) {
						// set Communicator.request
						sc.request = this.request;

						// set caller attribute in Conteroller in tab content, that is Popup instance
						sc.caller = this_;

						// set opener to popup's Controller
						if(this_.opener !== undefined) {
							sc["opener"] = this_.opener;
						}

						if(sc.init !== undefined) {
							sc.init(sc.view, this.request);
						}
					}

					callback.call(this_, opts.context);

					// TODO hide loading bar
	        	});
			},
			popOpen : function(onOpenData) {
				var opts = this.options;
				var this_ = this;

				if(opts.url === null) {
					opts.context.show();
				}
				this_.alert.show();

				// execute "onOpen" event
				if(opts.onOpen !== null) {
					if(onOpenData !== undefined) {
						opts.onOpenData = onOpenData;
					}
					if(opts.context.instance("cont")[opts.onOpen] !== undefined) {
						opts.context.instance("cont")[opts.onOpen](opts.onOpenData);
					} else {
						N.warn("[N.popup.popOpen]onOpen callback function \"" + opts.onOpen + "\" is undefined in popup content's Service Controller");
					}
				}
			}
		});

		// Tab
		var Tab = N.tab = function(obj, opts) {
			//TODO think more whether "onLoad event" needs or not
			this.options = {
				context : obj,
				links : obj.find("li"),
				classOpts : [], // classOpts : [{ url: undefined, width: "auto", active: false, preload: false, onOpen: undefined }]
				randomSel : false,
				onActive : null,
				contents : obj.find("> div"),
				effect : false
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui")["tab"]);
			} catch (e) {
				N.error("[N.tab]" + e, e);
			}

			var this_ = this;
			var opt;
			this.options.links.each(function(i) {
				var thisEle = $(this);
				opt = N.element.toOpts(thisEle);
				if(opt === undefined) {
					opt = {};
				}
				opt.target = thisEle.find("a").attr("href");
				this_.options.classOpts.push(opt);
			});

			if(opts !== undefined) {
				$.extend(this.options, opts);
			}

			this.options.context.addClass("tab__");

			Tab.wrapEle.call(this);

			this.options.context.instance("tab", this);
		};

		Tab.fn = Tab.prototype;
		$.extend(Tab.fn, {
			open : function(idx) {
				if(idx !== undefined) {
					$(this.options.links.get(idx)).click();
				}
				return this;
			}
		});

		$.extend(Tab, {
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			wrapEle : function() {
				var opts = this.options;
				// hide div contents
				opts.contents.hide();

				var this_ = this;

				var defSelIdx;
				$(opts.classOpts).each(function(i) {
					// set default select index
					if(this["active"] !== undefined && this["active"]) {
						// active option select
						defSelIdx = i;
					} else {
						if(opts.randomSel) {
							// random select
							defSelIdx = Math.floor(Math.random() * opts.links.length);
						} else {
							// default select
							if(i === 0) {
								defSelIdx = i;
							}
						}
					}

					if(this.preload !== undefined && this.preload === true) {
						if(this.url !== undefined) {
							Tab.loadContent.call(this_, this.url, i);
						}
					}
				});

				opts.links.bind("click.tab", function(e) {
					e.preventDefault();
					var thisEle = $(this);
					var thisIdx = opts.links.index(this);
					var thisClassOpts = opts.classOpts[thisIdx];

					// hide tab contents
					opts.contents.hide();
					var content = opts.contents.eq(thisIdx).show();

					opts.links.removeClass("tab_active__");
					thisEle.addClass("tab_active__");

					if(thisClassOpts.preload === undefined || thisClassOpts.preload === false) {
						// load content
						if(thisClassOpts.url !== undefined && thisEle.data("loaded") === undefined) {
							Tab.loadContent.call(this_, thisClassOpts.url, thisIdx);
						}
					}

					// run "onActive" event
					if(opts.onActive !== null) {
						opts.onActive.call(this, this, opts.links, opts.contents);
					}

					// excute "onOpen"(class option) event
					// excuted only when defined url with class(inline) option and tab is active
					if(thisClassOpts.onOpen !== undefined && thisEle.data("loaded")) {
						var sc = content.find(">").instance("cont");
						if(sc[thisClassOpts.onOpen] !== undefined) {
							//thisClassOpts.onOpen
							sc[thisClassOpts.onOpen]();
						} else {
							N.warn("[N.tab.wrapEle]onOpen callback function \"" + thisClassOpts.onOpen + "\" is undefined in tab content's Service Controller");
						}
					}

					if (opts.effect) {
						content.find(">").hide()[opts.effect[0]](opts.effect[1], opts.effect[2]);
					}
				});

				// select tab
				$(opts.links.get(defSelIdx)).click();
			},
			loadContent : function(url, targetIdx) {
				var opts = this.options;
				var this_ = this;

				// TODO show loading bar
				N.comm({
					url : url,
					contentType : "application/x-www-form-urlencoded",
					dataType : "html"
				}).submit(function(page) {
					var innerContent = opts.contents.eq(targetIdx).html(page).find(">");
					var activeTabEle = opts.links.eq(targetIdx);

					var sc = innerContent.instance("cont");

					// set Communicator.request
					sc.request = this.request;

					// set caller attribute in conteroller in tab content that is Tab instance
					sc.caller = this_;

					// set tab instance to tab contents Controller
					if(sc !== undefined) {
						if(sc.init !== undefined) {
							sc.init(sc.view, this.request);
						}
					}

					// run "onOpen" event
					if(activeTabEle.hasClass("tab_active__")) {
						var classOpts = opts.classOpts[targetIdx];
						if(classOpts.onOpen !== undefined) {
							if(sc[classOpts.onOpen] !== undefined) {
								//TODO think more how to work "onOpenData"
								sc[classOpts.onOpen]();
							} else {
								N.warn("[N.tab.loadContent]\"" + classOpts.onOpen + "\" onOpen callback function is undefined in tab content's Service Controller");
							}
						}
					}

					// set load status
					activeTabEle.data("loaded", true);

					// TODO hide loading bar
	        	});
			}
		});

		// Select
		var Select = N.select = function(data, opts) {
			this.options = {
				data : N.type(data) === "array" ? N(data) : data,
				context : null,
				key : null,
				val : null,
				append : true,
				direction : "h", // direction : h(orizontal), v(ertical)
				type : 0, // type : 1: select, 2: select[multiple='multiple'], 3: radio, 4: checkbox
				template : null
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui")["select"]);
			} catch (e) {
				N.error("[N.select]" + e, e);
			}
			$.extend(this.options, N.element.toOpts(this.options.context));

			if (N.isPlainObject(opts)) {
				$.extend(this.options, opts);
				this.options.context = N(opts.context);
			} else {
				this.options.context = N(opts);
			}
			this.options.template = this.options.context;

			Select.wrapEle.call(this);

			this.options.context.instance("select", this);

			return this;
		};

		Select.fn = Select.prototype;
		$.extend(Select.fn, {
			data : function(selFlag) {
				var opts = this.options;
				if(selFlag !== undefined && selFlag === true) {
					var rtnData = [];
					$(opts.context).vals(function(i) {
						rtnData.push(opts.data[i]);
					});
					return rtnData;
				} else if(selFlag !== undefined && selFlag === false) {
					return opts.data;
				} else {
					return opts.data.get();
				}
			},
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
		    bind : function() {
		    	var opts = this.options;
		    	if(opts.type === 1 || opts.type === 2) {
		    		var defaultSelectEle = opts.template.find("option.select_default__").clone(true);
	    			opts.context.addClass("select_template__").empty();
					if(opts.append) {
	    				opts.context.append(defaultSelectEle);
	    			}
					opts.data.each(function(i, data) {
						opts.context.append("<option value='" + data[opts.val] + "'>" + data[opts.key] + "</option>");
					});
		    	} else if(opts.type === 3 || opts.type === 4) {
		    		if(opts.context.filter(".select_template__").length == 0) {
		    			var id = opts.context.attr("id");
			    		opts.data.each(function(i, data) {
			    			if(i === 0) {
			    				opts.context.attr("name", id).attr("id", id + "_" + String(i)).attr("value", data[opts.val])
			    					.addClass("select_input__ select_template__");
			    			} else {
			    				opts.context.push($(opts.template.filter("input:eq(0)")).clone(true).attr("name", id).attr("id", id + "_" + String(i)).attr("value", data[opts.val]).removeClass("select_template__").get(0));
			    			}
			    			opts.context.push($('<label class="select_input_label__" for="' + id + "_" + String(i) + '">' + data[opts.key] + '</label>').get(0));
			    			if (opts.direction === "v" && opts.data.length - 1 != i) {
			    				opts.context.push($('<br class="select_input_br__" />').get(0));
			    			}
			    		});
			    		$(opts.template.filter("input:eq(0)")).after(opts.context);
		    		}
		    	}
		    	return this;
		    },
		    val : function(val) {
		    	return $(this.options.context).vals(val);
		    },
		    reset : function(selFlag) {
		    	var opts = this.options;
		    	if(opts.type === 1 || opts.type === 2) {
		    		if(selFlag !== undefined && selFlag === true) {
		    			opts.context.get(0).selectedIndex = 0;
		    		} else {
		    			opts.context.val(opts.context.prop("defaultSelected"));
		    		}
		    	} else if(opts.type === 3 || opts.type === 4) {
		    		opts.context.prop("checked", false)
		    	}
		    	return this;
		    }
		});

		$.extend(Select, {
			wrapEle : function() {
				var opts = this.options;
				if (opts.context.is("select") && opts.context.attr("multiple") != "multiple") {
					this.options.context.find("option").addClass("select_default__");
					opts.type = 1;
	            } else if (opts.context.is("select") && opts.context.attr("multiple") == "multiple") {
	            	this.options.context.find("option").addClass("select_default__");
	            	opts.type = 2;
	            } else if (opts.context.is("input:radio")) {
	            	opts.type = 3;
	            } else if (opts.context.is("input:checkbox")) {
	            	opts.type = 4;
	            }
			}
		});

		// Form
		var Form = N.form = function(data, opts) {
			this.options = {
				data : N.type(data) === "array" ? N(data) : data,
				row : -1,
				context : null,
				validate : true,
				html : false,
				addTop : false,
				fRules : null,
				vRules : null,
				extObj : null, // extObj : for N.grid
				extRow : -1, // extRow : for N.grid
				revert : false
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui")["form"]);
			} catch (e) {
				N.error("[N.form]" + e, e);
			}

			if (N.isPlainObject(opts)) {
				$.extend(this.options, opts);
				if(N.type(this.options.context) === "string") {
					this.options.context = N(this.options.context);
				}
				if(opts.row === undefined) {
					this.options.row = 0;
				}
			} else {
				this.options.row = 0;
				this.options.context = N(opts);
			}
			this.options.context.addClass("form__");

			if(this.options.revert) {
				this.revertData = $.extend({}, this.options.data[this.options.row]);
			}

			this.options.context.instance("form", this);

			if(this.options.extObj === null) {
				N.ds.instance(this, true);
			}

			return this;
		};
		Form.fn = Form.prototype;
		$.extend(Form.fn, {
			data : function(selFlag) {
				var opts = this.options;
				if(selFlag !== undefined && selFlag === true) {
					return [ opts.data[opts.row] ];
				} else if(selFlag !== undefined && selFlag === false) {
						return opts.data;
				} else {
					return opts.data.get();
				}
			},
			row : function() {
				return this.options.row;
			},
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			bind : function(row, data) {
				var opts = this.options;
				if(row !== undefined) {
					opts.row = row;
				}
				if(data !== undefined) {
					opts.data = N.type(data) === "array" ? N(data) : data;
					if(opts.revert) {
						this.revertData = $.extend({}, data[row]);
					}
				}
				var this_ = this;
				var vals;
				if (!N.isEmptyObject(opts.data) && !N.isEmptyObject(vals = opts.data[opts.row])) {
					var eles, ele, val, tagName, type;
					for ( var key in vals ) {
						eles = $("#" + key, opts.context);
						type = N.string.trimToEmpty(eles.attr("type")).toLowerCase();
						if (eles.length > 0 && type !== "radio" && type !== "checkbox") {
							eles.each(function() {
								ele = $(this);
								ele.removeClass("data_changed__");
								tagName = this.tagName.toLowerCase();
								type = N.string.trimToEmpty(ele.attr("type")).toLowerCase();
								if (tagName === "textarea" || type === "text" || type === "password" || type === "hidden" || type === "file") {
									//validate
									if(ele.data("validate") !== undefined) {
										if (type !== "hidden") {
											N().validator(opts.fRules !== null ? opts.fRules : ele);

											ele.unbind("focusout.form.validate");
											ele.bind("focusout.form.validate", function() {
												var currEle = $(this);
					                            if (!currEle.prop("disabled") && !currEle.prop("readonly") && opts.validate) {
				                            		currEle.trigger("validate");
					                            }
					                        });
										}
									}

									//dataSync
									ele.unbind("focusout.form.dataSync");
									ele.bind("focusout.form.dataSync", function() {
										var currEle = $(this);
										var currVal = currEle.val();
										if (String(vals[currEle.attr("id")]) !== currVal) {
											if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || (opts.validate && !currEle.hasClass("validate_false__")))) {
												vals[currEle.attr("id")] = currVal;
												if (vals["rowStatus"] != "insert") {
													vals["rowStatus"] = "update";
												}
												currEle.addClass("data_changed__");
												N.ds.instance(opts.extObj !== null ? opts.extObj : this_).notify(opts.extRow > -1 ? opts.extRow : opts.row, currEle.attr("id"));
											}
                                        }
									});
									//Enter key event
									ele.unbind("keyup.form.dataSync");
			                        ele.bind("keyup.form.dataSync", function(e) {
			                            if (e.which == 13) {
			                            	e.preventDefault();
			                            	$(this).trigger("focusout.form.validate");
			                            	$(this).trigger("focusout.form.dataSync");
			                            }
			                        });

				                    //format
			                        if(ele.data("format") !== undefined) {
										if (type !== "password" && type !== "hidden" && type !== "file") {
											N(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);

											ele.unbind("focusin.form.unformat");
											ele.bind("focusin.form.unformat", function() {
												var currEle = $(this);
					                            if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || (opts.validate && !currEle.hasClass("validate_false__")))) {
					                                currEle.trigger("unformat");
					                            }
					                        });

											ele.unbind("focusout.form.format");
											ele.bind("focusout.form.format", function() {
												var currEle = $(this);
					                            if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || (opts.validate && !currEle.hasClass("validate_false__")))) {
					                                currEle.trigger("format");
					                            }
					                        });
										}
									} else {
										ele.val(N.string.nullToEmpty(String(vals[key])));
									}
								} else if(tagName === "select") {
									//validate
									if(ele.data("validate") !== undefined) {
										if (opts.validate) {
											N().validator(opts.fRules !== null ? opts.fRules : ele);
										}
									}

									//dataSync
									ele.unbind("change.form.dataSync");
									ele.bind("change.form.dataSync", function() {
										var currEle = $(this);
										var currVals = currEle.vals();
										if (vals[currEle.attr("id")] !== currVals) {
											if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || (opts.validate && !currEle.hasClass("validate_false__")))) {
												vals[currEle.attr("id")] = currVals;
	                                            if (vals["rowStatus"] != "insert") {
	                                                vals["rowStatus"] = "update";
	                                            }
	                                            currEle.addClass("data_changed__");
	                                            N.ds.instance(opts.extObj !== null ? opts.extObj : this_).notify(opts.extRow > -1 ? opts.extRow : opts.row, currEle.attr("id"));
											}
                                        }
									});

									//Data bind
									ele.vals(vals[key]);
								} else if(tagName === "img") {
									ele.attr("src", N.string.nullToEmpty(String(vals[key])));
								} else {
									if(ele.data("format") !== undefined) {
										N(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);
									} else {
										val = N.string.nullToEmpty(String(vals[key]));
										if(!opts.html) {
											ele.text(val);
										} else {
											ele.html(val);
										}
									}
								}
							});
						} else {
							//radio, checkbox
							eles = $(opts.context).find("input:radio[id^='" + key + "'], input:checkbox[id^='" + key + "']");
							eles.removeClass("data_changed__");
							if(eles.length > 0) {
								//validate
								if(eles.filter(".select_template__").data("validate") !== undefined) {
									if (opts.validate) {
										N().validator(opts.fRules !== null ? opts.fRules : eles.filter(".select_template__"));
									}
								}

								//dataSync
								eles.unbind("click.form.dataSync select.form.dataSync");
								eles.bind("click.form.dataSync select.form.dataSync", function() {
									var currEle = $(this);
									var currKey = currEle.attr("name");
									if(currKey === undefined) {
										currKey = currEle.attr("id");
									}
									var currEles = currEle.siblings("input:" + currEle.attr("type") + "[id^='" + currEle.attr("name") + "']");
									currEles.push(this);
									var currVals = currEles.vals();
									if (vals[currKey] !== currVals) {
										if (!currEle.prop("disabled") && !currEle.prop("readonly")) {
											vals[currKey] = currVals;
	                                        if (vals["rowStatus"] != "insert") {
	                                            vals["rowStatus"] = "update";
	                                        }
	                                        currEles.addClass("data_changed__");
	                                        N.ds.instance(opts.extObj !== null ? opts.extObj : this_).notify(opts.extRow > -1 ? opts.extRow : opts.row, currKey);
										}
	                                }
								});

								eles.vals(vals[key]);
							}
						}
					}
					eles = val = undefined;
				}

				return this;
			},
			add : function() {
				var opts = this.options;
		        if (opts.data === null) {
		            throw new Error("[Form.add]Data is null. you must input data");
		        }

		        // set default values
		        var vals = N.element.toData(opts.context.find(":input").not(":button"));
		        vals.rowStatus = "insert";

	        	if(!opts.addTop) {
	        		opts.data.push(vals);
	        		this.options.row = opts.data.length - 1;
	        		if(opts.extObj !== null) {
	        			opts.extRow = opts.extObj.data().length - 1;
	        		}
	        	} else {
        			opts.data.splice(0, 0, vals);
	        		this.options.row = 0;
	        		opts.extRow = 0;
	        	}

	        	// Set revert data
				if(opts.revert) {
					this.revertData = $.extend({}, opts.data[opts.row]);
				}

		        N.ds.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);
		        this.update(opts.row);
				return this;
			},
			remove : function(row) {
				var opts = this.options;
				if(row === undefined || row > opts.data.length - 1) {
		        	N.error("[N.grid.remove]Row index out of range");
		        }

				opts.data.splice(row, 1);

				N.ds.instance(this).notify();
				return this;
			},
			revert : function() {
				var opts = this.options;
				if(!opts.revert) {
					N.error("[N.form.revert]Can not revert. N.form's revert option value is false");
				}
				$.extend(opts.data[opts.row], opts.data[opts.row], this.revertData);
				this.update(opts.row);
				N.ds.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);
				return this;
			},
			validate : function() {
				var opts = this.options;
				var eles = opts.context.find(":input");
				if(opts.validate) {
					eles.not(".validate_false__").trigger("unformat.formatter");
				} else {
					eles.trigger("unformat.formatter");
				}
				eles.trigger("validate.validator");
				eles.not(".validate_false__").trigger("format.formatter");

				// Focus to first input element with failed validation
				if(eles.filter(".validate_false__:eq(0)").length > 0) {
					eles.filter(".validate_false__:eq(0)").get(0).focus();
				}

				return eles.filter(".validate_false__").length > 0 ? false : true;
			},
			val : function(key, val, notify) {
				if(val === undefined) {
					return this.options.data[this.options.row][key];
				}
				var opts = this.options;
				var vals = opts.data[opts.row];
				var eles, ele;
				var this_ = this;
				var rdonyFg = false;
				var dsabdFg = false;
				eles = $(opts.context).find("#" + key);
				if (eles.length > 0) {
					var tagName = eles.get(0).tagName.toLowerCase();
					var type = N.string.trimToEmpty(eles.attr("type")).toLowerCase();
					if (type !== "radio" && type !== "checkbox") {
						eles.each(function() {
							ele = $(this);

			                if(ele.prop("readonly")) {
			                	ele.removeAttr("readonly");
			                    rdonyFg = true;
			                }
			                if(ele.prop("disabled")) {
			                	ele.removeAttr("disabled");
			                	dsabdFg = true;
			                }

							if (tagName === "textarea" || type === "text" || type === "password" || type === "hidden" || type === "file") {
								if(ele.data("format") !== undefined && ele.data("validate") !== undefined) {
									ele.val(String(val));
									//validate
									if (type !== "hidden") {
										ele.trigger("focusout.form.validate");
									}
									//dataSync
									ele.trigger("focusout.form.dataSync");
									//format
									if (!ele.is("input:password, input:hidden, input:file")) {
										ele.trigger("focusin.form.format");
										ele.trigger("focusout.form.unformat");
									}
								} else {
									ele.val(String(val));
									//dataSync
									ele.trigger("focusout.form.dataSync");
								}
							} else if(tagName === "select") {
								ele.vals(val);
								//dataSync
								ele.trigger("change.form.dataSync");
							} else if(tagName === "img") {
								var currVal = String(val);
								vals[ele.attr("id")] = currVal;
	                            if (vals["rowStatus"] != "insert") {
	                                vals["rowStatus"] = "update";
	                            }
	                            ele.addClass("data_changed__");
	                            if(notify === undefined || (notify !== undefined && notify === true)) {
	                            	N.ds.instance(opts.extObj !== null ? opts.extObj : this_).notify(opts.extRow > -1 ? opts.extRow : opts.row, ele.attr("id"));
	                            }
								ele.attr("src", currVal);
							} else {
								var currVal = String(val);
								vals[ele.attr("id")] = currVal;
	                            if (vals["rowStatus"] != "insert") {
	                                vals["rowStatus"] = "update";
	                            }
	                            ele.addClass("data_changed__");
	                            if(notify === undefined || (notify !== undefined && notify === true)) {
	                            	N.ds.instance(opts.extObj !== null ? opts.extObj : this_).notify(opts.extRow > -1 ? opts.extRow : opts.row, ele.attr("id"));
	                            }

	                            if(ele.data("format") !== undefined) {
									N(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);
								} else {
									if(!opts.html) {
										ele.text(currVal);
									} else {
										ele.html(currVal);
									}
								}
							}

							if(rdonyFg) {
								ele.prop("readonly", true);
			                }
			                if(dsabdFg) {
			                	ele.prop("disabled", true);
			                }
						});
					} else {
						//radio, checkbox
						eles = $(opts.context).find("input:radio[id^='" + key + "'], input:checkbox[id^='" + key + "']");
						if(eles.length > 0) {
							eles.vals(val);
							//dataSync
							$(eles.get(0)).trigger("select.form.dataSync");
						}
					}
				} else {
					this.options.data[this.options.row][key] = val;
				}
				return this;
			},
			update : function(row, key) {
				var opts = this.options;
				if (key === undefined) {
					this.bind(row);
				} else {
					this.val(key, opts.data[row][key], false);
				}
				N.element.dataChanged(opts.context.find("#" + key + ", input:radio[id='" + key + "'][name='" + key + "'], input:checkbox[id='" + key + "'][name='" + key + "']"));
				return this;
			}
		});

		// Grid
		var Grid = N.grid = function(data, opts) {
			this.options = {
				data : N.type(data) === "array" ? N(data) : data,
				removedData : [],
				context : null,
				heigth : 0,
				validate : true,
				html : false,
				addTop : false,
				resizable : false,
				vResizable : false,
				sortable : false,
				windowScrollLock : true,
				select : false,
				multiselect : false,
				hover : false,
				revert : false,
				createRowDelay : 1,
				scrollPaging : {
					idx : 0,
					size : 100
				},
				fRules : null,
				vRules : null,
				rowHandler : null,
				onSelect : null,
				onBind : null
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui").grid);

				//For $.extend method does not extend object type
				this.options.scrollPaging = $.extend({}, this.options.scrollPaging, N.context.attr("ui").grid.scrollPaging);
			} catch (e) {
				N.error("[N.grid]" + e, e);
			}

			if (N.isPlainObject(opts)) {
				$.extend(this.options, opts);
				//For $.extend method does not extend object type
				if(opts.scrollPaging !== undefined) {
					$.extend(this.options.scrollPaging, opts.scrollPaging);
				}

				//for scroll paging limit
				this.options.scrollPaging.limit = this.options.scrollPaging.size;

				if(N.type(this.options.context) === "string") {
					this.options.context = N(this.options.context);
				}
			} else {
				this.options.context = N(opts);
			}

			// set tbody template
			this.tbodyTemp = this.options.context.find("> tbody").clone(true, true);

			// set context style class
			this.options.context.addClass("grid__");
			// set context style class for hover option
			if(this.options.hover) {
				this.options.context.addClass("grid_hover__");
			}
			if(this.options.select || this.options.multiselect) {
				// set context style class for select, multiselect options
				this.options.context.addClass("grid_select__");

				var this_ = this;
				// bind tbody click event for select, multiselect options
				this.tbodyTemp.bind("click.grid.tbody", function() {
					var thisEle = $(this);
					if(thisEle.hasClass("grid_selected__")) {
						thisEle.removeClass("grid_selected__");
					} else {
						if(!this_.options.multiselect) {
							this_.options.context.find("> tbody").removeClass("grid_selected__");
						}
						thisEle.addClass("grid_selected__");
						if(this_.options.onSelect !== null) {
							this_.options.onSelect.call(thisEle, thisEle.index()-1, thisEle, this_.options.data);
						}
					}
				});
			}

			// set cell count in tbody
			this.cellCnt = Grid.cellCnt(this.tbodyTemp);

			// fixed header
			if(this.options.height > 0) {
				Grid.fixHeader.call(this);
			}

			// set tbody cell's id attribute into th cell in thead
			this.thead = Grid.setTheadCellInfo.call(this);

			// sortable, v(ertical)Resizable
			if(this.options.sortable) {
				Grid.sort.call(this);
			}

			// resizable column width
			if(this.options.resizable) {
				Grid.resize.call(this);
			}

			this.options.context.instance("grid", this);

			N.ds.instance(this, true);

			return this;
		};
		Grid.fn = Grid.prototype;
		$.extend(Grid.fn, {
			data : function(rowStatus) {
				if(rowStatus === undefined) {
					return this.options.data.get();
				} else if(rowStatus === false) {
					return this.options.data;
				} else if(rowStatus === "modified") {
					return this.options.data.datafilter(function(data) {
						return data.rowStatus !== undefined;
					}).get().concat(this.options.removedData);
				} else if(rowStatus === "delete") {
					return this.options.removedData;
				} else {
					return this.options.data.datafilter(function(data) {
						return data.rowStatus === rowStatus;
					}).get();
				}
			},
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			bind : function(data) {
				var opts = this.options;
				// remove all sort status
				this.thead.find("span.sortable__").remove();

				//empty removedData;
				if(arguments.callee.caller !== this.update) {
					opts.removedData = [];
				}
				//for internal call by scrollPaging
				var interCall = arguments[1] !== undefined && arguments[1] === true ? true : false;
				//to rebind new data
				if(data !== undefined) {
					opts.data = N.type(data) === "array" ? N(data) : data;
				}
				var tbodyTempClone;

				if (opts.data.length > 0) {
					//clear tbody visual effect
					opts.context.find("tbody").clearQueue().stop();
					if(!interCall) {
						opts.scrollPaging.idx = 0;
					}
					if(opts.scrollPaging.idx === 0) {
						//remove tbodys in grid body area
						opts.context.find("tbody").remove();
					}

					var i = opts.scrollPaging.idx;
					var this_ = this;
					var limit;
					if(opts.height > 0) {
						limit = Math.min(opts.scrollPaging.limit, opts.data.length);
					} else {
						limit = opts.data.length
					}
					var classOpts;
					var this_ = this;
					var delay = opts.createRowDelay;
					var lastIdx;
					var render = function() {
						// clone tbody for create new row
						tbodyTempClone = this_.tbodyTemp.clone(true, true).hide();
						opts.context.append(tbodyTempClone);

						if(opts.rowHandler !== null) {
							opts.rowHandler.call(tbodyTempClone, i, tbodyTempClone, opts.data[i]);
						}

						// for row data bind, use N.form
						N(opts.data[i]).form({
							context : tbodyTempClone,
							html: opts.html,
							validate : opts.validate,
							extObj : this_,
							extRow : i,
							revert : opts.revert
						}).bind();

						tbodyTempClone.show(delay, function() {
							i++;
							lastIdx = opts.scrollPaging.idx + limit - 1;
							if(i === lastIdx) {
								delay = 0;
							} else {
								delay = opts.createRowDelay;
							}
							if(i <= lastIdx) {
								render();
							} else if(i === lastIdx + 1) {
								if(opts.onBind !== null) {
									opts.onBind.call(opts.context, opts.context, opts.data);
								}
								opts.scrollPaging.limit = opts.scrollPaging.size;
							}
						});
					};
					render();
				} else {
					//remove tbodys in grid body area
					opts.context.find("tbody").remove();
					opts.context.append('<tbody><tr><td class="empty__" align="center" colspan="' + this.cellCnt + '">'
							+ N.message.get(opts.message, "empty") + '</td></tr></tbody>');
					opts.context.append(tbodyTempClone);
				}

				return this;
			},
			add : function() {
				var opts = this.options;
				if (opts.context.find("td.empty__").length > 0) {
					opts.context.find("tbody").remove();
				}
				var tbodyTempClone = this.tbodyTemp.clone(true, true);

				if(opts.addTop) {
					opts.context.find("thead").after(tbodyTempClone);
				} else {
					opts.context.append(tbodyTempClone);
				}

				// for new row data bind, use N.form
				var form = opts.data.form({
					context : tbodyTempClone,
					html: opts.html,
					validate : opts.validate,
					extObj : this,
					extRow : opts.addTop ? 0 : opts.data.length,
					addTop : opts.addTop,
					revert : opts.revert
				}).add();

				// focus to first input element
				if(tbodyTempClone.find(":input:eq(0)").length > 0) {
					tbodyTempClone.find(":input:eq(0)").get(0).focus();
				}

				return this;
			},
			remove : function(row) {
				var opts = this.options;
				if(row === undefined || row > opts.data.length - 1) {
		        	N.error("[N.grid.remove]Row index out of range");
		        }

				opts.context.find("tbody:eq(" + row + ")").remove();

				if (opts.data[row].rowStatus === "insert") {
		            opts.data.splice(row, 1);
		        } else {
		        	var removedData = opts.data.splice(row, 1)[0];
		        	removedData["rowStatus"] = "delete";
		            opts.removedData.push(removedData);
		        }

				N.ds.instance(this).notify();
				return this;
			},
			revert : function(row) {
				var opts = this.options;
				if(!opts.revert) {
					N.error("[N.form.revert]Can not revert. N.form's revert option value is false");
				}

				if(row !== undefined) {
					opts.context.find("tbody:eq(" + String(row) + ")").instance("form").revert();
				} else {
					opts.context.find("tbody").instance("form", function(i) {
						if(this.options !== undefined && (this.options.data[0].rowStatus === "update" || this.options.data[0].rowStatus === "insert")) {
							this.revert();
						}
					});
				}
				return this;
			},
			validate : function(row) {
				var opts = this.options;
				var valiRslt = true;
				if(row !== undefined) {
					valiRslt = opts.context.find("tbody:eq(" + String(row) + ")").instance("form").validate();
				} else {
					// Select the rows that rows data was not changed but that has failed validation input elements
					if(this.options.context.find(".validate_false__").length > 0) {
						this.options.context.find(".validate_false__").focusout();
						valiRslt = false;
					}

					var rowStatus;
					opts.context.find("tbody").instance("form", function(i) {
						if(this.options !== undefined && this.options.data.length > 0) {
							rowStatus = this.options.data[0].rowStatus;
							// Select the rows that data was changed
							if(rowStatus === "update" || rowStatus === "insert") {
								if(!this.validate()) {
									valiRslt = false;
								}
							}
						}
					});
				}

				return valiRslt;
			},
			val : function(row, key, val) {
				if(val === undefined) {
					return this.options.context.find("tbody:eq(" + String(row) + ")").instance("form").val(key);
				}
				this.options.context.find("tbody:eq(" + String(row) + ")").instance("form").val(key, val);
				return this;
			},
			update : function(row, key) {
				if(row !== undefined && key !== undefined) {
					this.options.context.find("tbody:eq(" + String(row) + ")").instance("form").update(0, key);
				} else {
					this.bind();
				}
				return this;
			}
		});

		$.extend(Grid, {
			fixHeader : function() {
				var opts = this.options;

				// addTop option is asolute true when fixed header mode
				opts.addTop = true;

				opts.context.css({
					"table-layout" : "fixed",
					"margin" : "0"
				});

		        var sampleCell = opts.context.find("tbody td:eq(0)");
		        var borderLeft = sampleCell.css("border-left-width") + " " + sampleCell.css("border-left-style") + " " + sampleCell.css("border-left-color");
		        var borderBottom = sampleCell.css("border-bottom-width") + " " + sampleCell.css("border-bottom-style") + " " + sampleCell.css("border-bottom-color");

		        // Root grid container
		        var gridWrap = opts.context.wrap('<div class="grid_wrap__"/>').parent();
		        gridWrap.css({
		        	"border-left" : borderLeft
		        });

		        //Create grid header
		        var scrollbarWidth = N.browser.scrollbarWidth();
		        var thead = opts.context.clone(true, true);
		        thead.find("tbody").remove();
		        thead.find("tfoot").remove();
		        var theadWrap = thead.wrap('<div class="thead_wrap__"/>').parent().css({
		        	"padding-right" : scrollbarWidth + "px",
		        	"margin-left" : "-1px"
		        });
		        gridWrap.prepend(theadWrap);

		        //Create grid body
		        opts.context.find("> thead th").empty().css({
		        	"height" : "0",
	                "padding-top" : "0",
	                "padding-bottom" : "0",
	                "border-top" : "none",
	                "border-bottom" : "none"
		        });
		        opts.context.find("> tbody td").css({
	                "border-top" : "none"
		        });
		        this.tbodyTemp.find("td").css({
	                "border-top" : "none"
		        });
		        var tbodyWrap = opts.context.wrap('<div class="tbody_wrap__"/>').parent().css({
		        	"height" : String(opts.height) + "px",
		        	"overflow-y" : "scroll",
		        	"margin-left" : "-1px",
		        	"border-bottom" : borderBottom
		        });

		        // for IE
		        if(N.browser.is("ie")) {
		        	tbodyWrap.css("overflow-x", "hidden");
		        }

		        if(opts.windowScrollLock) {
		        	tbodyWrap.bind('mousewheel.grid.fixHeader DOMMouseScroll.grid.fixHeader',function(e) {
        		        var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
        		        if (delta > 0 && $(this).scrollTop() <= 0) return false;
        		        if (delta < 0 && $(this).scrollTop() >= this.scrollHeight - $(this).height()) return false;
        		        return true;
        		    });
		        }

		        // Scroll paging
		        var this_ = this;
		        var defSPSize = opts.scrollPaging.limit;
		        var tbodyLength;
		        tbodyWrap.scroll(function() {
		        	var thisWrap = $(this);
                    if (thisWrap.scrollTop() >= opts.context.height() - thisWrap.height()) {
                    	tbodyLength = opts.context.find("> tbody").length;
                    	if (tbodyLength === opts.scrollPaging.idx + defSPSize) {
	                        if (tbodyLength > 0 && tbodyLength <= opts.data.length) {
	                            opts.scrollPaging.idx += defSPSize;
	                        }

	                        if (opts.scrollPaging.idx + opts.scrollPaging.limit >= opts.data.length) {
	                        	opts.scrollPaging.limit = opts.data.length - opts.scrollPaging.idx;
	                        } else {
	                        	opts.scrollPaging.limit = defSPSize;
	                        }

	                        if(opts.scrollPaging.idx < opts.data.length) {
	                        	this_.bind(undefined, true);
	                        }
	                    }
	                }
	            });

		        // Create grid footer
		        var tfootWrap;
		        if(opts.context.find("> tfoot").length > 0) {
		        	var tfoot = opts.context.clone(true, true);
			        opts.context.find("> tfoot").remove();
			        tfoot.find("thead").remove();
			        tfoot.find("tbody").remove();
			        tfootWrap = tfoot.wrap('<div class="tfoot_wrap__"/>').parent().css({
			        	"padding-right" : scrollbarWidth + "px",
			        	"margin-left" : "-1px"
			        });
			        gridWrap.append(tfootWrap);
		        }

		        // Vertical height resizing
		        if(opts.vResizable) {
		        	Grid.vResize.call(this, gridWrap, tbodyWrap, tfootWrap);
		        }
			},
			vResize : function(gridWrap, tbodyWrap, tfootWrap) {
        		var pressed = false;
	        	var vResizable = $('<div class="v_resizable__" align="center"></div>');
	        	vResizable.css("cursor", "n-resize");
	        	vResizable.css("margin-bottom", gridWrap.css("margin-bottom"));
	        	gridWrap.css("margin-bottom", "0");

	        	var currHeight, tbodyOffset, tfootHeight = 0;
	        	vResizable.bind("mousedown.grid.vResize", function() {
	        		if(tfootWrap !== undefined) {
		        		tfootHeight = tfootWrap.height();
		        	}
		        	tbodyOffset = tbodyWrap.offset();

	        		$(document).bind("dragstart.grid.vResize, selectstart.grid.vResize", function() {
	                    return false;
	                });
	        		pressed = true;

		        	$(window.document).bind("mousemove.grid.vResize", function(e) {
		        		if(pressed) {
		        			currHeight = (e.pageY - tbodyOffset.top - tfootHeight) + "px";
		        			tbodyWrap.css({
		        				"height" : currHeight,
		        				"max-height" : currHeight
		        			});
		        		}
			        });

		        	$(window.document).bind("mouseup.grid.vResize", function() {
		        		$(document).unbind("dragstart.grid.vResize").unbind("selectstart.grid.vResize").unbind("mousemove.grid.vResize").unbind("mouseup.grid.vResize");
		        		pressed = false;
		        	});
	        	});

	        	gridWrap.after(vResizable);
        	},
        	resize : function() {
				var opts = this.options;
				var theadCells = this.thead.find("> tr th");
				var resizeBar;
				var ele;

				var pressed = false;
				var cellEle;
				var defWidth;
				var nextDefWidth;
				var currWidth;
				var nextCurrWidth;
				var currCellEle;
				var currNextCellEle;
				var targetNextCellEle;
				var currCellEleTable;
				var targetCellEle;
				var targetCellEleWrap;
				var currResizeBarEle;
				var startOffsetX;
				var initHeight;
				var innerHeight;
				var scrollbarWidth = N.browser.scrollbarWidth();
				if(N.browser.is("safari")){
					theadCells.css("padding-left", "0");
					theadCells.css("padding-right", "0");
				}
				theadCells.each(function() {
					cellEle = $(this);
		            resizeBar = cellEle.append('<span class="resize_bar__"></span>').find("span.resize_bar__");
		            var resizeBarWidth = 6;
		            var resizeBarRightMargin = resizeBarWidth + (resizeBarWidth/2);
		            if(N.browser.is("safari")) {
		            	resizeBarRightMargin = 0;
		            } else if(N.browser.is("firefox")) {
		            	resizeBarRightMargin -= 1;
		            }

		            if(N.browser.is("ie") || N.browser.is("firefox")) {
		            	innerHeight = String(cellEle.innerHeight());
		            } else {
		            	innerHeight = String(cellEle.innerHeight() + 1);
		            }
		            resizeBar.css({
		            	"padding": "0px",
		            	"margin": "-" + cellEle.css("padding-top") + " -" + (resizeBarWidth/2 + parseInt(cellEle.css("padding-right"))) + "px -" + cellEle.css("padding-bottom") + " 0",
		            	"height": innerHeight + "px",
		            	"position": "absolute",
		            	"width": resizeBarWidth + "px",
		            	"cursor": "e-resize",
		            	"left": ((cellEle.offset().left + cellEle.width()) + resizeBarRightMargin) + "px"
		            });

		            resizeBar.bind("mousedown.grid.resize", function(e) {
		            	startOffsetX = e.pageX;
		            	currResizeBarEle = $(e.target);
		            	currCellEle = currResizeBarEle.parent("th");
		            	currNextCellEle = currResizeBarEle.parent("th").next();

		            	if(opts.height > 0) {
		            		targetCellEle = opts.context.find("thead th:eq(" + theadCells.index(currCellEle) + ")");
		            		targetNextCellEle = opts.context.find("thead th:eq(" + (theadCells.index(currCellEle) + 1) + ")");
		            		currCellEleTable = currCellEle.parents("table.grid__");
		            		targetCellEleWrap = targetCellEle.parents("div.tbody_wrap__");
		            	}

		            	// to block sort event
		            	currCellEle.data("sortLock", true);

		            	defWidth = currCellEle.innerWidth();
		            	nextDefWidth = currNextCellEle.innerWidth();

		            	initHeight = currCellEle.innerHeight() + 1;

		        		$(document).bind("dragstart.grid.resize, selectstart.grid.resize", function() {
		                    return false;
		                });
		        		pressed = true;

		        		var movedPx;
		        		var correction = scrollbarWidth + 1;
		        		if(N.browser.is("ie")) {
		        			correction = scrollbarWidth + 3;
	        			} else if(N.browser.is("safari")) {
		        			correction = scrollbarWidth - 21;
	        			} else if(N.browser.is("firefox")) {
		        			correction = scrollbarWidth + 3;
	        			}
		        		$(window.document).bind("mousemove.grid.resize", function(e) {
			        		if(pressed) {
			        			movedPx = e.pageX - startOffsetX;
			        			currWidth = defWidth + movedPx;
			        			nextCurrWidth = nextDefWidth - movedPx - correction;
			        			if(currWidth > 0 && nextCurrWidth > 0) {
				        			currCellEle.css("width", currWidth + "px");
			        				currNextCellEle.css("width", nextCurrWidth + "px");
			        				if(targetCellEle !== undefined) {
			        					targetCellEle.css("width", currWidth + "px");
			        					targetNextCellEle.css("width", nextCurrWidth + "px");
			        					targetCellEleWrap.width(currCellEleTable.width() + scrollbarWidth);
			        				}
			        			}
			        		}
				        });

			        	$(window.document).bind("mouseup.grid.resize", function(se) {
			        		theadCells.each(function() {
			        			var cellEle = $(this);
			        			cellEle.find("> span.resize_bar__").css("left", ((cellEle.offset().left + cellEle.width()) + resizeBarRightMargin) + "px");
			        		});
			        		$(document).unbind("dragstart.grid.resize").unbind("selectstart.grid.resize").unbind("mousemove.grid.resize").unbind("mouseup.grid.resize");
			        		pressed = false;
			        	});
		        	});
				});
			},
        	sort : function() {
    	        var opts = this.options;
    	        var thead = this.thead;

    	        var theadCells = thead.find("> tr th");
    	        theadCells.css("cursor", "pointer");
    	        var this_ = this;
    	        theadCells.bind("click.grid.sort", function(e) {
    	        	var currEle = $(this);
    	        	if(currEle.data("sortLock")) {
    	        		currEle.data("sortLock", false);
    	        		return false;
    	        	}
    	        	if (opts.data.length > 0) {
    	        		if(N.string.trimToNull($(this).text()) != null && $(this).find("input[type='checkbox']").length == 0) {
    	        			var isAsc = false;
    	        			if (currEle.find("span.sortable__").hasClass("asc__")) {
    	        				isAsc = true;
    	        			}
    	                    if (isAsc) {
    	                    	this_.bind(N(opts.data).datasort($(this).data("id"), true));
    	                    	currEle.append('<span class="sortable__ desc__">' + opts.sortableItem.asc + '</span>');
    	                    } else {
    	                    	this_.bind(N(opts.data).datasort($(this).data("id")));
    	                    	currEle.append('<span class="sortable__ asc__">' + opts.sortableItem.desc + '</span>');
    	                    }
    	        		}
    	        	}
    	        });
        	},
        	serverPaging : function() {
        		//TODO
        	},
        	setTheadCellInfo : function() {
        		var opts = this.options;
        		var thead;
    			if (opts.height > 0) {
    	        	thead = opts.context.closest("div.grid_wrap__").find("> div.thead_wrap__ thead");
    	        } else {
    	        	thead = opts.context.find("thead");
    	        }
    			var id;
    			this.tbodyTemp.find("> tr td").each(function(i) {
    				id = $(this).attr("id");
    				if(id === undefined) {
    					id = $(this).find("*").attr("id");
    				}
    				thead.find("> tr th:eq(" + i + ")").data("id", id);
                });
    			return thead;
        	},
			cellCnt : function(ele) {
		        return Math.max.apply(null, $.map(ele.find("tr"), function(el) {
		            var cellCnt = 0;
		            $(el).find("td, th").each(function() {
		                cellCnt += N.string.trimToZero($(this).attr("colspan")) == "0" ? 1 : Number(N.string.trimToZero($(this).attr("colspan")));
		            });
		            return cellCnt;
		        }));
		    }
		});

	})(N);

})(window, jQuery);