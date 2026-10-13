package com.gamescore.dto;

import java.time.LocalDate;

public class PuntuacionDTO {
    private Long id;
    private Integer puntos;
    private LocalDate fecha;
    private Long jugadorId;
    private String nombreJugador;

    public PuntuacionDTO() {
    }

    public PuntuacionDTO(Long id, Integer puntos, LocalDate fecha, Long jugadorId, String nombreJugador) {
        this.id = id;
        this.puntos = puntos;
        this.fecha = fecha;
        this.jugadorId = jugadorId;
        this.nombreJugador = nombreJugador;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getPuntos() {
        return puntos;
    }

    public void setPuntos(Integer puntos) {
        this.puntos = puntos;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public Long getJugadorId() {
        return jugadorId;
    }

    public void setJugadorId(Long jugadorId) {
        this.jugadorId = jugadorId;
    }

    public String getNombreJugador() {
        return nombreJugador;
    }

    public void setNombreJugador(String nombreJugador) {
        this.nombreJugador = nombreJugador;
    }
}
