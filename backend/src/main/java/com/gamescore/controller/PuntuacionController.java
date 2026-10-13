package com.gamescore.controller;

import com.gamescore.dto.PuntuacionDTO;
import com.gamescore.model.Jugador;
import com.gamescore.model.Puntuacion;
import com.gamescore.repository.JugadorRepository;
import com.gamescore.repository.PuntuacionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/puntuaciones", "/api/puntuaciones"})
@CrossOrigin(origins = "*")
public class PuntuacionController {

    private final PuntuacionRepository puntuacionRepository;
    private final JugadorRepository jugadorRepository;

    public PuntuacionController(PuntuacionRepository puntuacionRepository,
                                JugadorRepository jugadorRepository) {
        this.puntuacionRepository = puntuacionRepository;
        this.jugadorRepository = jugadorRepository;
    }

    // GET: Obtener todas las puntuaciones (ordenadas por puntos de mayor a menor)
    @GetMapping
    public List<Puntuacion> obtenerPuntuaciones() {
        return puntuacionRepository.findAllByOrderByPuntosDesc();
    }

    // GET: Obtener una puntuación por ID
    @GetMapping("/{id}")
    public ResponseEntity<Puntuacion> obtenerPorId(@PathVariable Long id) {
        Optional<Puntuacion> opt = puntuacionRepository.findById(id);
        return opt.map(ResponseEntity::ok)
                  .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // POST: Guardar una nueva puntuación
    // Acepta múltiples formatos JSON para máxima compatibilidad:
    // 1) { "puntos": 300, "fecha": "2026-10-13", "jugador": { "id": 1 } }
    // 2) { "puntos": 300, "fecha": "2026-10-13", "jugadorId": 1 }
    // 3) { "puntos": 300, "fecha": "2026-10-13", "nombreJugador": "Juan Pérez" }
    @PostMapping
    public ResponseEntity<?> guardarPuntuacion(@RequestBody Map<String, Object> body) {
        try {
            Integer puntos = null;
            if (body.containsKey("puntos") && body.get("puntos") != null) {
                puntos = Integer.valueOf(body.get("puntos").toString());
            } else {
                return ResponseEntity.badRequest().body("El campo 'puntos' es obligatorio.");
            }

            LocalDate fecha = LocalDate.now();
            if (body.containsKey("fecha") && body.get("fecha") != null && !body.get("fecha").toString().trim().isEmpty()) {
                fecha = LocalDate.parse(body.get("fecha").toString());
            }

            Jugador jugador = null;

            // Opción A: jugador como objeto anidado { "jugador": { "id": 1 } } o { "jugador": { "nombre": "Juan" } }
            if (body.containsKey("jugador") && body.get("jugador") instanceof Map<?, ?> jugMap) {
                if (jugMap.get("id") != null) {
                    Long jId = Long.valueOf(jugMap.get("id").toString());
                    jugador = jugadorRepository.findById(jId).orElse(null);
                }
                if (jugador == null && jugMap.get("nombre") != null) {
                    String nombre = jugMap.get("nombre").toString().trim();
                    jugador = jugadorRepository.findByNombreIgnoreCase(nombre)
                            .orElseGet(() -> jugadorRepository.save(new Jugador(nombre)));
                }
            }

            // Opción B: jugadorId directo { "jugadorId": 1 }
            if (jugador == null && body.containsKey("jugadorId") && body.get("jugadorId") != null) {
                Long jId = Long.valueOf(body.get("jugadorId").toString());
                jugador = jugadorRepository.findById(jId).orElse(null);
            }

            // Opción C: nombreJugador directo { "nombreJugador": "Juan" }
            if (jugador == null && body.containsKey("nombreJugador") && body.get("nombreJugador") != null) {
                String nombre = body.get("nombreJugador").toString().trim();
                if (!nombre.isEmpty()) {
                    jugador = jugadorRepository.findByNombreIgnoreCase(nombre)
                            .orElseGet(() -> jugadorRepository.save(new Jugador(nombre)));
                }
            }

            if (jugador == null) {
                return ResponseEntity.badRequest().body("Debe indicar un jugador válido (jugadorId, objeto jugador o nombreJugador).");
            }

            Puntuacion nueva = new Puntuacion(puntos, fecha, jugador);
            Puntuacion guardada = puntuacionRepository.save(nueva);

            return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al guardar puntuación: " + e.getMessage());
        }
    }

    // DELETE: Eliminar una puntuación por su ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPuntuacion(@PathVariable Long id) {
        if (puntuacionRepository.existsById(id)) {
            puntuacionRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
