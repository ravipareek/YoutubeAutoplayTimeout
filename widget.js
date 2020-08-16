var timeout = null;
var endTime = null;

// Call this when the pop-up is shown
chrome.runtime.sendMessage({ cmd: 'GET_TIME' }, response => {
  if (response.time) {
  	setAutoplayRunning(response.time)
  }
});

document.addEventListener('DOMContentLoaded', () => {
	var checkbox = document.getElementById('disableAutoplayCheckbox');
	getAutoplaySavedSetting((autoplaySetting) => {
		console.log(autoplaySetting)
		checkbox.checked = autoplaySetting
	})
	var dropdown = document.getElementById('timer');
	getAutoplayTimerSetting((timerSetting) => {
		console.log(timerSetting)
		for (var i = 0; i < dropdown.options.length; i++){
			if (dropdown.options[i].value == timerSetting + ""){
				dropdown.options[i].selected = true;
				let countdownTime = document.getElementById('countdownTime')
				if (timerSetting != 0){
					let timerValue = formatTimeLeft(timerSetting*60)
					countdownTime.innerText = (timerValue)
				}
			}
		}
	})
	checkbox.addEventListener('click', () => {
		var checkbox = document.getElementById('disableAutoplayCheckbox');
		setAutoplaySavedSetting(checkbox.checked);
        setAutoplay(checkbox.checked, dropdown.value);
	});
	dropdown.addEventListener('change', () => {
		let checkbox = document.getElementById('disableAutoplayCheckbox');
		checkbox.checked = false;
		setAutoplaySavedSetting(checkbox.checked)
		setAutoplay(false);
		let duration = dropdown.value != "" ? parseInt(dropdown.value) : 0;
		setAutoplayTimerSetting(duration)
		let countdownTime = document.getElementById('countdownTime')
		if (duration != 0){
			let timerValue = formatTimeLeft(duration*60)
			countdownTime.innerText = (timerValue)
		}

	});
});

function getAutoplayTimerStartSetting(callback) {
  chrome.storage.sync.get("autoplayStartTimer", (items) => {
    callback(chrome.runtime.lastError ? null : items["autoplayStartTimer"]);
  });
}

function setAutoplayTimerStartSetting(value) {
  var items = {};
  items["autoplayStartTimer"] = value;
  
  chrome.storage.sync.set(items);
}

function getAutoplaySavedSetting(callback) {
  chrome.storage.sync.get("autoplayDisabled", (items) => {
    callback(chrome.runtime.lastError ? null : items["autoplayDisabled"]);
  });
}

function setAutoplaySavedSetting(value) {
  var items = {};
  items["autoplayDisabled"] = value;
  
  chrome.storage.sync.set(items);
}

function getAutoplayTimerSetting(callback) {
  chrome.storage.sync.get("autoplayTimer", (items) => {
    callback(chrome.runtime.lastError ? null : items["autoplayTimer"]);
  });
}

function setAutoplayTimerSetting(value) {
  var items = {};
  items["autoplayTimer"] = value;
  
  chrome.storage.sync.set(items);
}

function setAutoplayRunning(endTime){
	timeout = setInterval(function() {
	let currentTime = new Date().getTime();
	let diff = Math.floor((endTime - currentTime)/1000);
	let diffText = formatTimeLeft(diff);
	let countdownTime = document.getElementById('countdownTime')
	countdownTime.innerText = diffText;

	if (diff < 0){
		clearInterval(timeout);
		let checkbox = document.getElementById('disableAutoplayCheckbox');
		let dropdown = document.getElementById('timer');
		let duration = dropdown.value != "" ? parseInt(dropdown.value) : 0;
		let countdownTime = document.getElementById('countdownTime')
		if (duration != 0){
			let timerValue = formatTimeLeft(duration*60)
			countdownTime.innerText = (timerValue)
		}
		checkbox.checked = false;
		setAutoplaySavedSetting(checkbox.checked)
		console.log("Setting autoplay to off at " + endTime);

		// copied
		var script = 'var wantDisabled='+true+'; var autoplayButton = document.getElementById("toggle");if(($("#toggle").attr("checked")==\'checked\' && wantDisabled)||($("#toggle").attr("checked")!=\'checked\' && !wantDisabled)){autoplayButton.click();console.log($("#toggle").attr("checked"));}';

		script += 'var wantDisabled='+true+'; var autoplayButton = document.getElementById("improved-toggle");if(($("#improved-toggle").attr("checked")==\'checked\' && wantDisabled)||($("#improved-toggle").attr("checked")!=\'checked\' && !wantDisabled)){autoplayButton.click();console.log($("#improved-toggle").attr("checked"));}';

		chrome.tabs.executeScript(null, { file: "jquery-3.2.1.min.js" }, function() {
			chrome.tabs.executeScript({
			  code: script
			});
		});
	}
}, 1000);
}


function setAutoplay(value, timer) {
	if (!value){
		console.log("Setting autoplay to " + value);
		let checkbox = document.getElementById('disableAutoplayCheckbox');
		let dropdown = document.getElementById('timer');
		let duration = dropdown.value != "" ? parseInt(dropdown.value) : 0;
		let countdownTime = document.getElementById('countdownTime')
		if (duration != 0){
			let timerValue = formatTimeLeft(duration*60)
			countdownTime.innerText = (timerValue)
		}
		checkbox.checked = false;
		setAutoplaySavedSetting(checkbox.checked)
		try{
			clearInterval(timeout)
			timeout = null;
		}
		catch{}
	}
	else{
		if (timer != ""){
			let duration = parseInt(timer) * 60000;
			let currentTime = new Date().getTime()
			setAutoplayTimerStartSetting(currentTime)
			let endTime = new Date(currentTime + duration).getTime()

			console.log("Starting " + duration + " millisecond countdown")
			chrome.runtime.sendMessage({ cmd: 'START_TIMER', duration: timer });
			timeout = setInterval(function() {
				let currentTime = new Date().getTime();
				let diff = Math.floor((endTime - currentTime)/1000);
				let diffText = formatTimeLeft(diff);
				let countdownTime = document.getElementById('countdownTime')
				countdownTime.innerText = diffText;

				if (diff < 0){
					clearInterval(timeout);
					let checkbox = document.getElementById('disableAutoplayCheckbox');
					let dropdown = document.getElementById('timer');
					let duration = dropdown.value != "" ? parseInt(dropdown.value) : 0;
					let countdownTime = document.getElementById('countdownTime')
					if (duration != 0){
						let timerValue = formatTimeLeft(duration*60)
						countdownTime.innerText = (timerValue)
					}
					checkbox.checked = false;
					setAutoplaySavedSetting(checkbox.checked)
					console.log("Setting autoplay to " + value + " after " + timer + " minutes");

					// copied
					var script = 'var wantDisabled='+value+'; var autoplayButton = document.getElementById("toggle");if(($("#toggle").attr("checked")==\'checked\' && wantDisabled)||($("#toggle").attr("checked")!=\'checked\' && !wantDisabled)){autoplayButton.click();console.log($("#toggle").attr("checked"));}';

					script += 'var wantDisabled='+value+'; var autoplayButton = document.getElementById("improved-toggle");if(($("#improved-toggle").attr("checked")==\'checked\' && wantDisabled)||($("#improved-toggle").attr("checked")!=\'checked\' && !wantDisabled)){autoplayButton.click();console.log($("#improved-toggle").attr("checked"));}';

					chrome.tabs.executeScript(null, { file: "jquery-3.2.1.min.js" }, function() {
						chrome.tabs.executeScript({
						  code: script
						});
					});
				}
			}, 1000);
		}
		else{
			console.log("Setting autoplay to " + value);
		}
	}
}

// sent in seconds
function formatTimeLeft(time) {
	let hours = Math.floor(time/3600);
	let minutes = Math.floor((time%3600)/60);
	let seconds = Math.floor(time%60);

	return `${leadingZero(hours)}:${leadingZero(minutes)}:${leadingZero(seconds)}`;
}

function leadingZero(num) {
    var s = num+"";
    while (s.length < 2) s = "0" + s;
    return s;
}
