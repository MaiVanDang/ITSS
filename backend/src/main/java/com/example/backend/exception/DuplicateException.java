package com.example.backend.exception;

public class DuplicateException extends RuntimeException  {
    public DuplicateException(String message) {
        super(message);
    }
}
