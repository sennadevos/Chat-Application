package com.hethond.chatbackend.security;

import com.hethond.chatbackend.entities.User;
import com.hethond.chatbackend.services.SessionService;
import com.hethond.chatbackend.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

@Component
public class HandshakeHandler extends HttpSessionHandshakeInterceptor {
    private static final Logger logger = LoggerFactory.getLogger(HandshakeHandler.class);

    private final SessionService sessionService;
    private final UserService userService;

    @Autowired
    public HandshakeHandler(final SessionService sessionService,
                            final UserService userService) {
        this.sessionService = sessionService;
        this.userService = userService;
    }

    @Override
    public boolean beforeHandshake(final ServerHttpRequest request,
                                   final ServerHttpResponse response,
                                   final WebSocketHandler wsHandler,
                                   final Map<String, Object> attributes) throws Exception {
        final String token = extractToken(request);

        final UUID userId = sessionService.getUserIdBySession(token);
        final User authenticatedUser = userService.findUserById(userId);

        final Collection<GrantedAuthority> authorities = Collections.singletonList(authenticatedUser.getRole().getAuthority());
        final var authentication = new UsernamePasswordAuthenticationToken(userId.toString(), null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return super.beforeHandshake(request, response, wsHandler, attributes);
    }

    private String extractToken(final ServerHttpRequest request) {
        final Map<String, List<String>> params = UriComponentsBuilder.fromUri(request.getURI()).build().getQueryParams();
        final List<String> tokenParam = params.get("token");

        if (tokenParam == null || tokenParam.isEmpty()) {
            logger.error("WebSocket handshake attempted without token parameter");
            throw new IllegalArgumentException("Missing token parameter");
        }

        return tokenParam.get(0);
    }
}
