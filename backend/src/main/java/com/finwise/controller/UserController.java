package com.finwise.controller;

import com.finwise.dto.UserDTO;
import com.finwise.entity.User;
import com.finwise.exception.UserAlreadyExistsException;
import com.finwise.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    public UserController(UserService userService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    @GetMapping("/auth/user")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(Map.of("isAuthenticated", false));
        }

        try {
            String email = null;

            if (authentication instanceof UsernamePasswordAuthenticationToken) {
                email = authentication.getName();
                System.out.println("Form Login Email: " + email);
            } else {
                // Fallback - try to get email from principal
                Object principal = authentication.getPrincipal();
                if (principal instanceof UserDetails) {
                    email = ((UserDetails) principal).getUsername();
                } else {
                    email = principal.toString();
                }
                System.out.println("Auth Email: " + email);
            }

            if (email != null && !email.equals("anonymousUser")) {
                Optional<User> optionalUser = userService.findByEmail(email);
                User user = optionalUser.get();

                if (user != null) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("isAuthenticated", true);

                    // Create user map with null-safe values
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("username", user.getUsername() != null ? user.getUsername() : "");
                    userMap.put("email", user.getEmail() != null ? user.getEmail() : "");
                    userMap.put("firstName", user.getFirstName() != null ? user.getFirstName() : "");
                    userMap.put("lastName", user.getLastName() != null ? user.getLastName() : "");
                    userMap.put("isNewUser", user.isNewUser());
                    userMap.put("imageUrl", user.getImage_url() != null ? user.getImage_url() : "");
                    userMap.put("role", user.getRole() != null ? user.getRole() : "USER");
                    userMap.put("familyProfileId", user.getProfile() != null ? user.getProfile().getId() : null);

                    response.put("user", userMap);
                    return ResponseEntity.ok(response);
                } else {
                    System.err.println("User not found with email: " + email);
                }
            } else {
                System.err.println("Email is null or anonymousUser");
            }

        } catch (Exception e) {
            System.err.println("Error getting current user: " + e.getMessage());
            e.printStackTrace();
        }

        return ResponseEntity.ok(Map.of("isAuthenticated", false));
    }




    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        try {
            SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
            logoutHandler.logout(request, response, authentication);

            SecurityContextHolder.clearContext();

            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/auth/register")
    public ResponseEntity<Map<String, Object>> registerUser(
            @Valid @RequestBody UserDTO registrationDto,
            BindingResult bindingResult) {

        Map<String, Object> response = new HashMap<>();

        // Check for validation errors
        if (bindingResult.hasErrors()) {
            response.put("success", false);
            response.put("message", "Validation failed");
            response.put("errors", bindingResult.getAllErrors());
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Check if user already exists
            if (userService.existsByEmail(registrationDto.getEmail())) {
                response.put("success", false);
                response.put("message", "An account with this email already exists");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            if (userService.existsByUsername(registrationDto.getUsername())) {
                response.put("success", false);
                response.put("message", "Username is already taken");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            // Register the user
            User registeredUser = userService.registerNewUser(registrationDto);

            // Automatically log in the user after registration
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            registrationDto.getEmail(),
                            registrationDto.getPassword()
                    )
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Prepare success response
            response.put("success", true);
            response.put("message", "Registration successful");
            response.put("user", Map.of(
                    "id", registeredUser.getId(),
                    "username", registeredUser.getUsername(),
                    "email", registeredUser.getEmail(),
                    "firstName", registeredUser.getFirstName(),
                    "lastName", registeredUser.getLastName(),
                    "isNewUser", registeredUser.isNewUser()
            ));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (UserAlreadyExistsException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> loginUser(
            @RequestBody Map<String, String> loginRequest,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            // IMPORTANT: Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Create and save session
            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            // Get user details
            Optional<User> optionalUser = userService.findByEmail(email);
            User user = optionalUser.get();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName(),
                    "isNewUser", user.isNewUser()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

}
