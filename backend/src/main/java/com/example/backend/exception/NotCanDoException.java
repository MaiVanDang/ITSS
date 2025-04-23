package com.example.backend.exception;

public class NotCanDoException extends RuntimeException {
    public NotCanDoException(String message) {super(message);}
    public NotCanDoException(String message, Throwable cause) {
        super(message, cause);
    }

}
