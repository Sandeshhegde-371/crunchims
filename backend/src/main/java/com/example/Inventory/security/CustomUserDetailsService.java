package com.example.Inventory.security;

import com.example.Inventory.model.Account;
import com.example.Inventory.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        Account account = accountRepository
                .findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // ✅ ADD ROLE HERE
        return new User(
                account.getEmail(),
                account.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + account.getRole()))
        );
    }
}