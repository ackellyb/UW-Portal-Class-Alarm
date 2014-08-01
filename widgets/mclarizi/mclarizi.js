function mclarizi(userid, htmlId) {
	var templates = {};
	var apiKey = "?key=8842fcd2130a486a636d632b28d890b8";
	var googleApi = "AIzaSyDOx9e1fSI3haH-IvAbBvfhNwjZZ8pO-xc";
	var clientID = "736760673038-947rvgri6rbcglil31geh6hoh6njt1fl.apps.googleusercontent.com";
	var secret = "Z5eW5_bOKd9DT5RrnIdWBpAF";
	var scope = "https://www.googleapis.com/auth/calender"

	function auth() {
		var config = {
			'client_id': clientID,
			'scope': scope
		};
		gapi.auth.authorize(config, function() {
			console.log('login complete');
			console.log(gapi.auth.getToken());
		});
	}

	function insertCal(){
		console.log("entering Insert Cal");
		var timezone = new Date().getTimezoneOffset();
		var dateTime;
		var dateTime1 = model.schedule['M'].startDate();
		var dateTime2 = model.schedule['T'].startDate();
		var dateTime3 = model.schedule['W'].startDate();
		var dateTime4 = model.schedule['Th'].startDate();
		var dateTime5 = model.schedule['F'].startDate();
		for(var i = 1; i < 6; i++) {
			if (i == 1) {
				dateTime = dateTime1;
			}
			else if (i == 2) {
				dateTime = dateTime2;
			}
			else if (i == 3) {
				dateTime = dateTime3;
			}
			else if (i == 4) {
				dateTime = dateTime4;
			}
			else if (i == 5) {
				dateTime = dateTime5;
			}
		}
		console.log["Making Google Call"];
			$.ajax({
				url: "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxAttendees=1&sendNotifications=true&fields=recurrence%2Creminders&key={" + googleApi + "}",
				dataType: 'json',
				data: {
					end: {dateTime: dateTime, timeZone: timezone},
					start: {dateTime: dateTime, timeZone: timezone},
					reminder: { useDefault: true},
					recurrence: "RRULE:FREQ=WEEKLY;" },
				success: function (data) {
					model.loadFinalPage();
					finalView.initView();
				},
				error: function (data) {
					model.updateViews("errorTerm");
				}
			});
		}


	function ClassTime(timeStr, dateStr) {
		this.hour = parseInt(timeStr.substring(0, 2));
		this.minute = parseInt(timeStr.substring(3,5));
		this.startDate = function() {
			var now = Date.now();
			var month = dateStr.substring(0,2);
			var day = dateStr.subtrackMins(3,5);
			return new Date(now.getYear(), month, day, this.hour, this.minute, 0);
		};

		this.isBigger = function(time) {
			if (this.hour === time.hour) {
				return (this.minute > time.minute);
			} else {
				return (this.hour > time.hour);
			}
		};

		this.subtrackMins = function(min) {
			var hourSub = Math.floor(min / 60);
			var minSub = min % 60;
			if (this.minute - minSub < 0) {
				hourSub+=1;
				this.minute = this.minute+60;

			}
			this.hour = (this.hour - hourSub)%24;
			this.minute = (this.minute - minSub)%60;
		};

		this.toString = function() {
			return this.hour+":"+this.minute;
		};

	}

	var model = {
		views: [],
		courses: [],
		schedule: new Object(),
		term: {},

		/**
		 * Add a new view to be notified when the model changes.
		 */
		addView: function (view) {
			this.views.push(view);
			view("");
		},

		/**
		 * Update all of the views that are observing us.
		 */
		updateViews: function (msg) {
			var i = 0;
			for (i = 0; i < this.views.length; i++) {
				this.views[i](msg);
			}
		},

		loadBasePage: function () {
			model.updateViews("base");
		},

		loadConfirmPage: function (time) {
			var that = this;

			$.ajax({
				url: "https://api.uwaterloo.ca/v2/terms/list.json"+apiKey,
				dataType: 'json',
				success: function(data) {
					if (data.meta.status === 200) {
						that.term = data.data.current_term.toString();
					} else {
						model.updateViews("error");
					}
				},
				error: function() {
					model.updateViews("error");
				}
			});

			$.ajax({
				url: "https://cs349.student.cs.uwaterloo.ca:9410/api/v1/student/stdCourseDetails/"+userid,
				dataType: 'json',
				success: function(data) {

					function filterCorrectTerm(element, index, array) {
						return (element.term == that.term.toString());
					}

					function filterOnlineClasses(element, index, array) {
						return !jQuery.isEmptyObject(element.meets);
					}

					function filterTests(element, index, array) {
						return (element.componentCode != "TST");
					}

					function mapSection(element, index, array) {
						return element.sections;
					}

					function mapMeets(element, index, array) {
						return element.meets;
					}

					function createSchedule(element, index, array) {
						var days = [];
						var dayTemp = "";
						var dateStr = element[0].meetDays.toString();

						for(i =0; i < dateStr.length; i++) {
							if (dayTemp.length > 0 && dateStr[i] === dateStr[i].toUpperCase()) {
								days.push(dayTemp);
								dayTemp = "";
							}
							dayTemp = dayTemp + dateStr[i];
						}
						if (dayTemp.length > 0) {
							days.push(dayTemp)
						}

						for(i = 0; i < days.length; i++) {
							var classTime = new ClassTime(element[0].meetTimes.substring(0, 5), element[0].meetDates);
							classTime.subtrackMins(time);
							if (that.schedule.hasOwnProperty(days[i])) {
								var isBigger = classTime.isBigger(that.schedule[days[i]]);
								if (!isBigger) {
									that.schedule[days[i]] = classTime;
								}
							} else {
								that.schedule[days[i]] = classTime;
							}
						}
					}
					if (data.meta.status === "200 OK") {
						if (!jQuery.isEmptyObject(data.result)){
							that.courses = [].concat.apply([], data.result.terms.filter(filterCorrectTerm).pop().courses.map(mapSection));
							that.courses = that.courses.filter(filterTests).filter(filterOnlineClasses).map(mapMeets);
							that.courses.forEach(createSchedule);
							var output = '';
							for (var property in that.schedule) {
								output += property + ': ' + that.schedule[property]+'; ';
							}
							console.log(output);
							model.updateViews("confirm");
						}
					} else {
						model.updateViews("error");
					}
				},
				error: function() {
					model.updateViews("error");
				}
			});
		},

		loadFinalPage: function () {
			model.updateViews("final");
		}

	};

	var baseView = {
		updateView: function (msg) {
			if (msg === "confirm") {
				var t = Mustache.render(templates.confirmPage, model);
				$(htmlId).html(t);
			} else if (msg === "error") {
				$(htmlId).html(templates.error);
			}
		},

		initView: function () {
			console.log("Initializing baseView");

			/*
			 * Set the controller for the "Go" button.
			 * Get the subject and catalog from the input fields and
			 * then tell the model to get the corresponding course.
			 */
			$("#mclarizi_scheduleButton").click(function () {
				var time = $("#mclarizi_timeInput").val();
				console.log("Schedule clicked: " + time);
				if (time != ""){
					model.loadConfirmPage(time);
					confirmView.initView(time);
				}
				else{

				}
			});
			$("#mclarizi_googleSignIn").click(function () {
				auth();
			});
			model.addView(baseView.updateView);
		}
	};

	var confirmView = {
		updateView: function (msg) {
			if (msg === "base") {
				$(htmlId).html(templates.baseHtml);
			} else if (msg === "final") {
				$(htmlId).html(templates.finalPage);
			} else if (msg === "error") {
				$(htmlId).html(templates.error);
			}
		},

		initView: function () {
			console.log("Initializing confirmView");

			/*
			 * Set the controller for the "Go" button.
			 * Get the subject and catalog from the input fields and
			 * then tell the model to get the corresponding course.
			 */
			$("#mclarizi_yesButton").click(function () {
				console.log("Yes clicked!");
				insertCal();
			});
			$("#mclarizi_editButton").click(function () {
				console.log("Edit clicked!");
				model.loadBasePage();
				baseView.initView();
			});
			model.addView(confirmView.updateView);
		}
	};

	var finalView = {
		updateView: function (msg) {
			if (msg === "base") {
				$(htmlId).html(templates.baseHtml);
			} else if (msg === "error") {
				$(htmlId).html(templates.error);
			}
		},

		initView: function () {
			console.log("Initializing finalView");

			/*
			 * Set the controller for the "Go" button.
			 * Get the subject and catalog from the input fields and
			 * then tell the model to get the corresponding course.
			 */
			$("#mclarizi_lastEditButton").click(function () {
				console.log("LastEdit clicked!");
				model.loadBasePage();
				baseView.initView();
			});
			model.addView(finalView.updateView);
		}
	};

	/*
	 * Initialize the widget.
	 */
	portal.loadTemplates("widgets/mclarizi/templates.json",
		function (t) {
			templates = t;
			$(htmlId).html(templates.baseHtml);
			baseView.initView();
		});
}