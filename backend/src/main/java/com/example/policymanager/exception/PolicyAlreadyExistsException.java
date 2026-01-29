package com.example.policymanager.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class PolicyAlreadyExistsException extends RuntimeException {
    public PolicyAlreadyExistsException(String message) {
        super(message);
    }
}