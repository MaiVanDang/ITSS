package com.example.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ExceptionHanlder {

    @ExceptionHandler(value = {NotFoundException.class})
    public ResponseEntity<Object> handleNotFoundException
            (NotFoundException notFoundException){
        Exception exception = new Exception(
                notFoundException.getMessage(),
                notFoundException.getCause(),
                HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(exception, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(value = {DuplicateException.class})
    public ResponseEntity<Object> handleDuplicateException
            (DuplicateException duplicateException){
        Exception exception = new Exception(
                duplicateException.getMessage(),
                duplicateException.getCause(),
                HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(exception, HttpStatus.BAD_REQUEST);
    }
}
