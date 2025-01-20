let cargoList = [
	{
		id: "Груз001",
		name: "Строительные материалы",
		status: "В пути",
		origin: "Москва",
		destination: "Казань",
		departureDate: "2024-11-24"
	},
	{
		id: "Груз002",
		name: "Хрупкий груз",
		status: "Ожидает отправки",
		origin: "Санкт-Петербург",
		destination: "Екатеринбург",
		departureDate: "2024-11-26"
	}
];

function generateCargoID() {
	const lastCargo = cargoList[cargoList.length - 1];
	if (lastCargo) {
		const lastID = parseInt(lastCargo.id.replace('Груз', ''));
		return 'Груз' + String(lastID + 1).padStart(3, '0');
	} else {
		return 'Груз001';
	}
}

function saveToLocalStorage() {
	localStorage.setItem('cargoList', JSON.stringify(cargoList));
}

function loadFromLocalStorage() {
	const storedCargo = localStorage.getItem('cargoList');
	if (storedCargo) {
		cargoList = JSON.parse(storedCargo);
	}
}

function renderCargoTable(filterStatus = 'all') {
	const tableBody = document.getElementById('cargoTableBody');
	tableBody.innerHTML = '';

	const filteredCargo = filterStatus === 'all' ? cargoList : cargoList.filter(cargo => cargo.status === filterStatus);

	filteredCargo.forEach(cargo => {
		const tr = document.createElement('tr');
		let statusClass = '';
		if (cargo.status === "Ожидает отправки") {
			statusClass = 'status-awaiting';
		} else if (cargo.status === "В пути") {
			statusClass = 'status-in-transit';
		} else if (cargo.status === "Доставлен") {
			statusClass = 'status-delivered';
		}

		tr.innerHTML = `
		 <td>${cargo.id}</td>
		 <td>${cargo.name}</td>
		 <td class="${statusClass}">
			<select class="form-select form-select-sm status-select">
			  <option value="Ожидает отправки" ${cargo.status === "Ожидает отправки" ? 'selected' : ''}>Ожидает отправки</option>
			  <option value="В пути" ${cargo.status === "В пути" ? 'selected' : ''}>В пути</option>
			  <option value="Доставлен" ${cargo.status === "Доставлен" ? 'selected' : ''}>Доставлен</option>
			</select>
		 </td>
		 <td>${cargo.origin}</td>
		 <td>${cargo.destination}</td>
		 <td>${cargo.departureDate}</td>
	  `;

		const statusSelect = tr.querySelector('.status-select');
		statusSelect.addEventListener('change', function () {
			const newStatus = this.value;
			const currentDate = new Date();
			const departureDate = new Date(cargo.departureDate);

			if (newStatus === "Доставлен" && currentDate < departureDate) {
				alert('Невозможно установить статус "Доставлен", так как текущая дата меньше даты отправления.');
				this.value = cargo.status;
			} else {
				cargo.status = newStatus;
				renderCargoTable(document.getElementById('filterStatus').value);
			}
		});

		tableBody.appendChild(tr);
	});

	saveToLocalStorage();
}

document.getElementById('addCargoForm').addEventListener('submit', function (event) {
	event.preventDefault();

	const name = document.getElementById('cargoName').value.trim();
	const origin = document.getElementById('origin').value;
	const destination = document.getElementById('destination').value;
	const departureDate = document.getElementById('departureDate').value;
	const status = document.getElementById('status').value;

	if (!name || !origin || !destination || !departureDate) {
		alert('Пожалуйста, заполните все поля формы.');
		return;
	}

	if (origin === destination) {
		alert('Пункт отправления и пункт назначения не могут быть одинаковыми.');
		return;
	}

	const departure = new Date(departureDate);
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	if (status === "Доставлен" && departure > today) {
		alert('Невозможно установить статус "Доставлен", так как дата отправления находится в будущем.');
		return;
	}

	const newCargo = {
		id: generateCargoID(),
		name: name,
		status: status,
		origin: origin,
		destination: destination,
		departureDate: departureDate
	};

	cargoList.push(newCargo);

	this.reset();
	document.getElementById('status').value = "Ожидает отправки";

	renderCargoTable(document.getElementById('filterStatus').value);
	saveToLocalStorage();
});

document.getElementById('filterStatus').addEventListener('change', function () {
	renderCargoTable(this.value);
});

document.getElementById('clearCargoButton').addEventListener('click', function () {
	if (confirm('Вы уверены, что хотите удалить все грузы?')) {
		cargoList = [];
		renderCargoTable();
		saveToLocalStorage();
	}
});

document.addEventListener('DOMContentLoaded', function () {
	loadFromLocalStorage();
	renderCargoTable();
});
