package com.jeevanlink.user.security;

import com.jeevanlink.user.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationHours;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-hours:24}") long expirationHours
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationHours = expirationHours;
    }

    public String generate(User user) {
        Instant now = Instant.now();
        Instant exp = now.plus(expirationHours, ChronoUnit.HOURS);
        return Jwts.builder()
                .subject(user.getId().toString())
                .claims(Map.of(
                        "email", user.getEmail(),
                        "role", user.getRole().name(),
                        "fullName", user.getFullName() == null ? "" : user.getFullName()
                ))
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(signingKey)
                .compact();
    }
}
