"use strict";

const MAXIMO_TARJETAS_VISIBLES = 6;

const elementos = {
  buscador: document.querySelector("#buscador"),
  filtros: [...document.querySelectorAll(".filtro")],
  lista: document.querySelector("#lista-tarjetas"),
  contador: document.querySelector("#contador-resultados"),
  estadoVacio: document.querySelector("#estado-vacio"),
  limpiarFiltros: document.querySelector("#limpiar-filtros"),
  mostrarAleatorio: document.querySelector("#mostrar-aleatorio"),
  mensajeError: document.querySelector("#mensaje-error")
};

const nombresCategorias = {
  alfabeto: "Alfabeto",
  numeros: "Números",
  "signos-basicos": "Signos básicos",
  "vocales-acentuadas": "Vocales acentuadas",
  "palabras-basicas": "Palabras básicas"
};

let contenidos = [];
let categoriaActiva = "todas";

function normalizarTexto(texto) {
  return texto
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function mezclarAleatoriamente(lista) {
  const copia = [...lista];

  for (let i = copia.length - 1; i > 0; i--) {
    const indiceAleatorio = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[indiceAleatorio]] = [copia[indiceAleatorio], copia[i]];
  }

  return copia;
}

function limitarResultados(lista) {
  return mezclarAleatoriamente(lista).slice(0, MAXIMO_TARJETAS_VISIBLES);
}

function crearTarjeta(item) {
  const articulo = document.createElement("article");
  articulo.className = "tarjeta";
  articulo.dataset.categoria = item.categoria;

  const visual = document.createElement("div");
  visual.className = "tarjeta-visual";

  const simbolo = document.createElement("div");
  simbolo.className = "simbolo-visual";
  simbolo.textContent = item.simbolo;
  simbolo.setAttribute("aria-label", `Símbolo visual: ${item.nombre}`);

  const braille = document.createElement("div");
  braille.className = "simbolo-braille";
  braille.textContent = item.braille;
  braille.setAttribute("aria-label", `Representación Braille de ${item.nombre}: ${item.braille}`);

  const cuerpo = document.createElement("div");
  cuerpo.className = "tarjeta-cuerpo";

  const categoria = document.createElement("p");
  categoria.className = "categoria";
  categoria.textContent = nombresCategorias[item.categoria] || item.categoria;

  const titulo = document.createElement("h3");
  titulo.textContent = item.nombre;

  const descripcion = document.createElement("p");
  descripcion.className = "descripcion";
  descripcion.textContent = item.descripcion;

  visual.append(simbolo, braille);
  cuerpo.append(categoria, titulo, descripcion);
  articulo.append(visual, cuerpo);

  return articulo;
}

function obtenerResultados() {
  const consulta = normalizarTexto(elementos.buscador.value);

  return contenidos.filter((item) => {
    const coincideCategoria = categoriaActiva === "todas" || item.categoria === categoriaActiva;
    const textoConsultable = normalizarTexto(
      `${item.simbolo} ${item.nombre} ${item.descripcion} ${nombresCategorias[item.categoria] || ""}`
    );
    const coincideBusqueda = consulta === "" || textoConsultable.includes(consulta);

    return coincideCategoria && coincideBusqueda;
  });
}

function actualizarContador(cantidadMostrada, cantidadTotalFiltrada) {
  const total = contenidos.length;
  const busquedaVacia = elementos.buscador.value.trim() === "";
  const vistaGeneral = categoriaActiva === "todas" && busquedaVacia;

  if (vistaGeneral) {
    elementos.contador.textContent =
      total <= MAXIMO_TARJETAS_VISIBLES
        ? `${total} contenidos disponibles`
        : `Mostrando ${cantidadMostrada} signos aleatorios de ${total} contenidos disponibles`;
    return;
  }

  if (cantidadTotalFiltrada === 0) {
    elementos.contador.textContent = "0 resultados encontrados";
    return;
  }

  if (cantidadTotalFiltrada <= MAXIMO_TARJETAS_VISIBLES) {
    elementos.contador.textContent =
      cantidadTotalFiltrada === 1
        ? "1 resultado encontrado"
        : `${cantidadTotalFiltrada} resultados encontrados`;
    return;
  }

  elementos.contador.textContent =
    `Mostrando ${cantidadMostrada} signos aleatorios de ${cantidadTotalFiltrada} resultados encontrados`;
}

function renderizar() {
  const resultados = obtenerResultados();
  const resultadosVisibles = limitarResultados(resultados);
  const fragmento = document.createDocumentFragment();

  resultadosVisibles.forEach((item) => {
    fragmento.appendChild(crearTarjeta(item));
  });

  elementos.lista.replaceChildren(fragmento);
  elementos.lista.hidden = resultados.length === 0;
  elementos.estadoVacio.hidden = resultados.length !== 0;

  if (elementos.mostrarAleatorio) {
    elementos.mostrarAleatorio.hidden = resultados.length <= MAXIMO_TARJETAS_VISIBLES;
  }

  actualizarContador(resultadosVisibles.length, resultados.length);
}

function mostrarMasSignos() {
  renderizar();

  if (elementos.lista) {
    elementos.lista.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function seleccionarCategoria(botonSeleccionado) {
  categoriaActiva = botonSeleccionado.dataset.categoria;

  elementos.filtros.forEach((boton) => {
    const estaActivo = boton === botonSeleccionado;
    boton.classList.toggle("activo", estaActivo);
    boton.setAttribute("aria-pressed", String(estaActivo));
  });

  renderizar();
}

function restablecerVista() {
  elementos.buscador.value = "";
  const botonTodas = elementos.filtros.find((boton) => boton.dataset.categoria === "todas");

  if (botonTodas) {
    seleccionarCategoria(botonTodas);
  }

  elementos.buscador.focus();
}

async function cargarContenidos() {
  try {
    const respuesta = await fetch("braille.json");

    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos)) {
      throw new TypeError("El archivo braille.json debe contener una lista.");
    }

    contenidos = datos;
    elementos.lista.setAttribute("aria-busy", "false");
    renderizar();
  } catch (error) {
    console.error("No fue posible cargar braille.json:", error);
    elementos.lista.setAttribute("aria-busy", "false");
    elementos.lista.hidden = true;
    elementos.contador.textContent = "Contenido no disponible";
    elementos.mensajeError.hidden = false;

    if (elementos.mostrarAleatorio) {
      elementos.mostrarAleatorio.hidden = true;
    }
  }
}

elementos.buscador.addEventListener("input", renderizar);

elementos.filtros.forEach((boton) => {
  boton.addEventListener("click", () => seleccionarCategoria(boton));
});

if (elementos.limpiarFiltros) {
  elementos.limpiarFiltros.addEventListener("click", restablecerVista);
}

if (elementos.mostrarAleatorio) {
  elementos.mostrarAleatorio.addEventListener("click", () => {
    renderizar();
  });
}

cargarContenidos();
