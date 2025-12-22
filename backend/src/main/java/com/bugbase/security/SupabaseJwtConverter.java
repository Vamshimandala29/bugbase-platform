package com.bugbase.security;

import com.bugbase.model.Role;
import com.bugbase.model.User;
import com.bugbase.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SupabaseJwtConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String sub = jwt.getSubject();
        UUID userId = UUID.fromString(sub);
        String email = jwt.getClaimAsString("email");

        // Get user metadata
        Map<String, Object> metadata = jwt.getClaimAsMap("user_metadata");
        String fullName = metadata != null ? (String) metadata.get("full_name") : null;
        if (fullName == null)
            fullName = email != null ? email.split("@")[0] : "User";

        final String userEmail = email;
        final String userFullName = fullName;

        User user = userRepository.findById(userId).orElseGet(() -> {
            User newUser = User.builder()
                    .id(userId)
                    .email(userEmail)
                    .fullName(userFullName)
                    .role(Role.MEMBER) // Default role
                    .passwordHash("EXTERNAL_AUTH") // Not used
                    .build();
            return userRepository.save(newUser);
        });

        // Update email or fullName if changed in Supabase
        boolean changed = false;
        if (email != null && !email.equalsIgnoreCase(user.getEmail())) {
            user.setEmail(email);
            changed = true;
        }
        if (fullName != null && !fullName.equals(user.getFullName())) {
            user.setFullName(fullName);
            changed = true;
        }
        if (changed) {
            user = userRepository.save(user);
        }

        return new UsernamePasswordAuthenticationToken(user, jwt, user.getAuthorities());
    }
}
