package com.gamescore.controller;

import com.gamescore.model.Jugador;
import com.gamescore.repository.JugadorRepository;
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

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping({"/jugadores", "/api/jugadores"})
@CrossOrigin(origins = "*")
public class JugadorController {

    private final JugadorRepository jugadorRepository;

    public JugadorController(JugadorRepository jugadorRepository) {
        this.jugadorRepository = jugadorRepository;
    }

    // GET: Obtener todos los jugadores
    @GetMapping
    public List<Jugador> obtenerJugadores() {
        return jugadorRepository.findAll();
    }

    // GET: Obtener un jugador por ID
    @GetMapping("/{id}")
    public ResponseEntity<Jugador> obtenerPorId(@PathVariable Long id) {
        Optional<Jugador> opt = jugadorRepository.findById(id);
        return opt.map(ResponseEntity::ok)
                  .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // POST: Crear un nuevo jugador
    @PostMapping
    public ResponseEntity<Jugador> crearJugador(@RequestBody Jugador jugador) {
        if (jugador.getNombre() == null || jugador.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Si ya existe un jugador con ese nombre, reutilizarlo o guardarlo
        Optional<Jugador> existente = jugadorRepository.findByNombreIgnoreCase(jugador.getNombre().trim());
        if (existente.isPresent()) {
            return ResponseEntity.ok(existente.get());
        }

        Jugador nuevo = new Jugador(jugador.getNombre().trim());
        Jugador guardado = jugadorRepository.save(nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    // DELETE: Eliminar jugador por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarJugador(@PathVariable Long id) {
        if (jugadorRepository.existsById(id)) {
            jugadorRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
