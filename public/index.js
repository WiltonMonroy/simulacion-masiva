var socketIo = io.connect('/', { 'forceNew': true });
var datos = { sa: 0, al: 0, nu: 0, to: 0, li: 0, co: "" }

$(document).ready(function () {
	$("#btnVotar").attr('disabled', 'disabled');
	$("#btnMostrar").click(function () {
		Limpiar();
	});
});



socketIo.on('connected', function (data) {
	datos = data;
	//console.log(datos);

	$("#btnMostrar").show();
	datos.to = datos.sa + datos.al + datos.nu;

	$("#spConectados").text(datos.li.toLocaleString('es-GT'));
	$("#spSa").text(datos.sa.toLocaleString('es-GT'));
	$("#spAl").text(datos.al.toLocaleString('es-GT'));
	$("#spNu").text(datos.nu.toLocaleString('es-GT'));
	$("#spTo").text(datos.to.toLocaleString('es-GT'));
	Dona();
});

socketIo.on('grafica', function (data) {
	console.log(data);

	if (data.id == 1) {
		datos.sa += 1;
		$("#spSa").text(datos.sa.toLocaleString('es-GT'));
	}
	else if (data.id == 2) {
		datos.al += 1;
		$("#spAl").text(datos.al.toLocaleString('es-GT'));
	}
	else if (data.id == 3) {
		datos.nu += 1;
		$("#spNu").text(datos.nu.toLocaleString('es-GT'));
	}

	datos.to = datos.sa + datos.al + datos.nu;
	$("#spTo").text(datos.to.toLocaleString('es-GT'));
	Dona();

});


socketIo.on('usuarios', function (data) {
	$("#spConectados").text(data.toLocaleString('es-GT'));
});

function Seleccionar() {
	$("#btnVotar").attr('disabled', 'disabled');
	var id = $("#ddlVoto").val();
	if (id > 0)
		$("#btnVotar").removeAttr('disabled');
}

function Limpiar() {
	$("#btnVotar").attr('disabled', 'disabled');
	$("#ddlVoto").val(0);
}

function Votar() {
	var id = $("#ddlVoto").val();
	var key = "6LfJxEMnAAAAANlleWPQwip-XlCka2JrKo8T7WxY";

	if (!navigator.onLine) {
		MostrarVentana("No hay conexión de internet activa");
		return;
	}

	grecaptcha.execute(key, { action: 'enviar' })
		.then(function (token) {
			if (token === "") {
				MostrarVentana("Error al verificar el captcha");
				return;
			}
			socketIo.emit("votar", {
				id: id,
				co: datos.co,
				to: token
			});

			datos.co = "";
			$('#myModalVoto').modal('hide');
		});
}

function MostrarVentana(texto) {
	$("#spError").text(texto);
	$("#spTitulo").html("Nuevo");
	$('#myModal').modal('show');
}

function Dona() {
	var ctx = document.getElementById("myChart");
	var myChart = new Chart(ctx, {
		type: 'pie',
		data: {
			labels: ['SI', 'REGULAR', 'NO'],
			datasets: [{
				label: '# of Votos',
				data: [datos.sa, datos.al, datos.nu],
				backgroundColor: [
					'rgba(75, 192, 192, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 99, 132, 0.5)',
				],
				borderColor: [
					'rgba(75, 192, 192, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255,99,132,1)'
				],
				borderWidth: 1
			}]
		},
		options: {
			cutoutPercentage: 40,
			responsive: true,

		}
	});
}
