function mclarizi(userid, htmlId) {
	var templates = {};

	var apiKey = "8842fcd2130a486a636d632b28d890b8";
	/*
	 * Initialize the widget.
	 */
	portal.loadTemplates("widgets/mclarizi/templates.json",
		function (t) {
			templates = t;
			$(htmlId).html(templates.finalPage);
		});
}