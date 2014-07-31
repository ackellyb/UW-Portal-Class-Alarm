function mclarizi(userid, htmlId) {
	var templates = {};
	var apiKey = "?key=8842fcd2130a486a636d632b28d890b8";
	var googleApi = "AIzaSyDOx9e1fSI3haH-IvAbBvfhNwjZZ8pO-xc";
	var clientID = "736760673038-947rvgri6rbcglil31geh6hoh6njt1fl.apps.googleusercontent.com";

	var model = {
		views: [],
		courses: [],
		schedule: [],
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
						that.term = data.data.current_term;
					} else {
						model.updateViews("errorTerm");
					}
				},
				error: function() {
					model.updateViews("errorTerm");
				}
			});

			$.ajax({
				url: "https://cs349.student.cs.uwaterloo.ca:9410/api/v1/student/stdCourseDetails/"+userid,
				dataType: 'json',
				success: function(data) {

					function filterCorrectTerm(element, index, array) {
						return element.term === that.term;
					}

					function mapMeetTimes(element, index, array) {
						return element.section.meets;
					}

					if (data.meta.status === "200 OK") {
						that.courses = data.result;
						model.updateViews("courses");
					} else {
						model.updateViews("errorCourse1");
					}
				},
				error: function() {
					model.updateViews("errorCourse");
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
				$(htmlId).html(templates.confirmPage);
			} else if (msg === "courses") {
				$(htmlId).html(model.courses.html);
			} else if (msg === "error") {
				$(htmlId).html("ERROR BITCH");
			} else if (msg === "errorTerm") {
				$(htmlId).html("ERROR BITCH tmer");
			} else if (msg === "errorCourse") {
				$(htmlId).html("ERROR BITCH course");
			} else if (msg === "errorCourse1") {
				$(htmlId).html("ERROR BITCH course1");
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
					confirmView.initView();
				}
				else{

				}
			});
			$("#mclarizi_googleSignIn").click(function () {

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
				model.loadFinalPage();
				finalView.initView();
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
				$(htmlId).html(templates.finalPage);
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