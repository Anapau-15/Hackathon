#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Address, String};
// Importar el estándar SEP-41 Token
use soroban_token_sdk::Token;

// --- Definición del Contrato ---
#[contract]
pub struct SustenCoinContract;

#[contractimpl]
impl SustenCoinContract {
    // 1. Inicialización del Token (SEP-41 estándar)
    pub fn initialize(
        env: Env,
        admin: Address,
        decimal: u32,
        name: String,
        symbol: String,
    ) {
        // Llama a la lógica de inicialización del token estándar
        Token::initialize(
            &env,
            &admin,
            &decimal,
            &name,
            &symbol,
        );
        // Almacenar cuentas de Fundaciones y Museos (ej. usando DataKeys)
        env.storage().instance().set(&symbol_short!("FOUND_CANC"), &Address::from_string(&String::from_slice(&env, "GB7N...")));
        env.storage().instance().set(&symbol_short!("MUSEUM_T"), &Address::from_string(&String::from_slice(&env, "GCX5...")));
    }

    // 2. Acuñar/Emitir Tokens (Recompensa de Experiencia)
    // Asumimos que un 'oráculo' (servidor backend) o el Admin llama a esta función
    pub fn issue_reward(env: Env, to: Address, amount: i128, exp_id: String) {
        // Solo el Admin o el Oráculo de la DApp pueden llamar a esta función
        // * Aquí iría la lógica de autenticación (require_auth) *

        // Simula la verificación de que la experiencia (exp_id) fue completada
        // En una DApp real, el Oráculo verifica la ruta de Google Maps Off-Chain
        // y luego llama a esta función On-Chain.

        Token::mint(&env, &env.current_contract_address(), &to, &amount);
        env.events().publish((symbol_short!("reward"), symbol_short!("issued")), (to, exp_id, amount));
    }

    // 3. Canjear por Entradas (BURN)
    pub fn burn_for_ticket(env: Env, from: Address, amount: i128, ticket_type: String) {
        from.require_auth();
        
        // Transferencia (quemado) de tokens a la cuenta del contrato o a una cuenta de "quemado"
        Token::transfer(&env, &from, &env.current_contract_address(), &amount); 

        // Emitir un evento que el backend (servicio de canje) debe escuchar
        env.events().publish((symbol_short!("ticket"), symbol_short!("redeemed")), (from, ticket_type, amount));

        // Enviar un mensaje de confirmación
        // En la DApp, el frontend mostrará el código de canje después de este evento.
    }
    
    // 4. Donación a Fundaciones (TRANSFER)
    pub fn donate(env: Env, from: Address, amount: i128, foundation_key: String) {
        from.require_auth();

        // Obtener la dirección de la fundación (simulada aquí)
        let foundation_address_data = env.storage().instance().get(&foundation_key).unwrap();
        let foundation_address: Address = foundation_address_data;

        // Transferir los tokens directamente a la wallet de la fundación
        Token::transfer(&env, &from, &foundation_address, &amount); 

        env.events().publish((symbol_short!("donate"), symbol_short!("sent")), (from, foundation_address, amount));
    }
    
    // Función para obtener el balance del usuario (SEP-41 estándar)
    pub fn balance(env: Env, id: Address) -> i128 {
        Token::balance(&env, id)
    }
}