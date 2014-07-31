function mclarizi(userid, htmlId) {
	var templates = {};
	var apiKey = "8842fcd2130a486a636d632b28d890b8";

	var model = {
		views: [],

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
			model.updateViews("confirm");
		},

		loadFinalPage: function () {
			model.updateViews("final");
		}

	};

	var baseView = {
		updateView: function (msg) {
			if (msg === "confirm") {
				$(htmlId).html(templates.confirmPage);
			} else if (msg === "error") {
				$(htmlId).html("ERROR BITCH");
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
				model.loadConfirmPage(time);
				confirmView.initView();
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