"use strict";

const elementos = {
  buscador: document.querySelector("#buscador"),
  filtros: [...document.querySelectorAll(".filtro")],
  lista: document.querySelector("#lista-tarjetas"),
  contador: document.querySelector("#contador-resultados"),
  estadoVacio: document.querySelector("#estado-vacio"),
  limpiarFiltros: document.querySelector("#limpiar-filtros"),
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

function actualizarContador(cantidad) {
  const total = contenidos.length;

  if (cantidad === total && categoriaActiva === "todas" && elementos.buscador.value.trim() === "") {
    elementos.contador.textContent = `${total} contenidos disponibles`;
    return;
  }

  elementos.contador.textContent = cantidad === 1
    ? "1 resultado encontrado"
    : `${cantidad} resultados encontrados`;
}

function renderizar() {
  const resultados = obtenerResultados();
  const fragmento = document.createDocumentFragment();

  resultados.forEach((item) => fragmento.appendChild(crearTarjeta(item)));
  elementos.lista.replaceChildren(fragmento);
  elementos.lista.hidden = resultados.length === 0;
  elementos.estadoVacio.hidden = resultados.length !== 0;
  actualizarContador(resultados.length);
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
  seleccionarCategoria(botonTodas);
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
  }
}

elementos.buscador.addEventListener("input", renderizar);
elementos.filtros.forEach((boton) => {
  boton.addEventListener("click", () => seleccionarCategoria(boton));
});
elementos.limpiarFiltros.addEventListener("click", restablecerVista);

cargarContenidos();
