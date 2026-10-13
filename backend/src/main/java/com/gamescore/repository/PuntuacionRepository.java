package com.gamescore.repository;

import com.gamescore.model.Puntuacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PuntuacionRepository extends JpaRepository<Puntuacion, Long> {
    List<Puntuacion> findAllByOrderByPuntosDesc();
    List<Puntuacion> findAllByOrderByFechaDesc();
    List<Puntuacion> findByJugadorId(Long jugadorId);
}
