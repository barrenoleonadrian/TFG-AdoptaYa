-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 19-04-2026 a las 18:41:46
-- Versión del servidor: 8.0.44
-- Versión de PHP: 8.2.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `adoptaya`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mascotas`
--

CREATE TABLE `mascotas` (
  `id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo` enum('perro','gato','conejo','pajaro','otro') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `raza` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sexo` enum('macho','hembra') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `edad` int DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `ciudad` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `imagen` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` enum('disponible','reservado','adoptado') COLLATE utf8mb4_general_ci DEFAULT 'disponible',
  `usuario_id` int DEFAULT NULL,
  `fecha_publicacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mascotas`
--

INSERT INTO `mascotas` (`id`, `nombre`, `tipo`, `raza`, `sexo`, `edad`, `descripcion`, `ciudad`, `imagen`, `estado`, `usuario_id`, `fecha_publicacion`) VALUES
(1, 'Rex', 'perro', 'Dálmata', 'macho', 4, 'Perro muy enérgico y le gusta correr', 'Madrid', 'rex.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(2, 'Kiara', 'gato', 'Bengalí', 'hembra', 2, 'Gata muy activa y curiosa', 'Barcelona', 'kiara.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(3, 'Bobby', 'perro', 'Cocker Spaniel', 'macho', 3, 'Muy cariñoso y juguetón', 'Sevilla', 'bobby.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(4, 'Lola', 'conejo', 'Belier', 'hembra', 1, 'Coneja tranquila ideal para casa', 'Valencia', 'lola.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(5, 'Felix', 'gato', 'Maine Coon', 'macho', 5, 'Gato grande y muy tranquilo', 'Bilbao', 'felix.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(6, 'Spike', 'perro', 'Husky', 'macho', 3, 'Le encanta correr y jugar', 'Zaragoza', 'spike.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(7, 'Canela', 'perro', 'Chihuahua', 'hembra', 2, 'Pequeña pero muy valiente', 'Málaga', 'canela.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(8, 'Pelusa', 'gato', 'British Shorthair', 'hembra', 4, 'Muy tranquila y cariñosa', 'Granada', 'pelusa.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(9, 'Duke', 'perro', 'Gran Danés', 'macho', 5, 'Perro gigante pero muy dócil', 'Madrid', 'duke.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(10, 'Nina', 'pajaro', 'Canario', 'hembra', 1, 'Ave pequeña que canta mucho', 'Barcelona', 'nina.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(11, 'Otto', 'perro', 'Akita', 'macho', 4, 'Muy fiel y protector', 'Valencia', 'otto.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(12, 'Sasha', 'gato', 'Ragdoll', 'hembra', 3, 'Gata muy dulce y tranquila', 'Sevilla', 'sasha.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(13, 'Nico', 'conejo', 'Enano', 'macho', 1, 'Conejo pequeño muy juguetón', 'Bilbao', 'nico.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(14, 'Koda', 'perro', 'Samoyedo', 'macho', 2, 'Muy amigable y con mucho pelo', 'Zaragoza', 'koda.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(15, 'Alma', 'gato', 'Sphynx', 'hembra', 3, 'Gata sin pelo muy cariñosa', 'Málaga', 'alma.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(16, 'Tango', 'pajaro', 'Periquito', 'macho', 2, 'Ave muy sociable y juguetona', 'Granada', 'tango.jpg', 'disponible', 1, '2026-03-10 09:00:00'),
(17, 'Bruno', 'perro', 'Labrador', 'macho', 3, 'Perro muy cariñoso y juguetón', 'Madrid', 'bruno.jpg', 'disponible', 1, '2026-03-09 11:59:16'),
(18, 'Luna', 'gato', 'Europeo', 'hembra', 1, 'Gata tranquila y muy sociable', 'Barcelona', 'luna.jpg', 'disponible', 1, '2026-03-09 11:59:16'),
(19, 'Rocky', 'perro', 'Pastor Alemán', 'macho', 5, 'Perro protector y muy fiel', 'Sevilla', 'rocky.jpg', 'disponible', 1, '2026-03-09 11:59:16'),
(20, 'Nube', 'conejo', 'Mini Lop', 'hembra', 1, 'Coneja muy tranquila y cariñosa', 'Valencia', 'nube.jpg', 'disponible', 1, '2026-03-09 11:59:16'),
(21, 'Milo', 'gato', 'Persa', 'macho', 4, 'Gato muy tranquilo que le gusta dormir', 'Málaga', 'milo.jpg', 'disponible', 1, '2026-03-09 11:59:16'),
(22, 'Coco', 'pajaro', 'Cotorra', 'macho', 2, 'Ave muy sociable y habladora', 'Bilbao', 'coco.jpg', 'disponible', 1, '2026-03-09 11:59:16'),
(23, 'Toby', 'perro', 'Beagle', 'macho', 2, 'Perro muy activo ideal para familias', 'Zaragoza', 'toby.jpg', 'disponible', 1, '2026-03-09 11:59:16'),
(24, 'Mia', 'gato', 'Siames', 'hembra', 3, 'Gata muy cariñosa con las personas', 'Valencia', 'mia.jpg', 'disponible', 1, '2026-03-09 11:59:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes`
--

CREATE TABLE `mensajes` (
  `id` int NOT NULL,
  `remitente_id` int DEFAULT NULL,
  `destinatario_id` int DEFAULT NULL,
  `mensaje` text COLLATE utf8mb4_general_ci,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `refugios`
--

CREATE TABLE `refugios` (
  `id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `ciudad` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `usuario_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes_adopcion`
--

CREATE TABLE `solicitudes_adopcion` (
  `id` int NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `mascota_id` int DEFAULT NULL,
  `mensaje` text COLLATE utf8mb4_general_ci,
  `estado` enum('pendiente','aceptada','rechazada') COLLATE utf8mb4_general_ci DEFAULT 'pendiente',
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo` enum('adoptante','protectora','admin') COLLATE utf8mb4_general_ci DEFAULT 'adoptante',
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ciudad` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `tipo`, `telefono`, `ciudad`, `fecha_registro`) VALUES
(1, 'Admin', 'admin@adoptaya.com', '1234', 'admin', NULL, NULL, '2026-03-09 11:57:44');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `mascotas`
--
ALTER TABLE `mascotas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `remitente_id` (`remitente_id`),
  ADD KEY `destinatario_id` (`destinatario_id`);

--
-- Indices de la tabla `refugios`
--
ALTER TABLE `refugios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `solicitudes_adopcion`
--
ALTER TABLE `solicitudes_adopcion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `mascota_id` (`mascota_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `mascotas`
--
ALTER TABLE `mascotas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `refugios`
--
ALTER TABLE `refugios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `solicitudes_adopcion`
--
ALTER TABLE `solicitudes_adopcion`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `mascotas`
--
ALTER TABLE `mascotas`
  ADD CONSTRAINT `mascotas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD CONSTRAINT `mensajes_ibfk_1` FOREIGN KEY (`remitente_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `mensajes_ibfk_2` FOREIGN KEY (`destinatario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `refugios`
--
ALTER TABLE `refugios`
  ADD CONSTRAINT `refugios_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `solicitudes_adopcion`
--
ALTER TABLE `solicitudes_adopcion`
  ADD CONSTRAINT `solicitudes_adopcion_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `solicitudes_adopcion_ibfk_2` FOREIGN KEY (`mascota_id`) REFERENCES `mascotas` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
