import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { RegisterRequest, LoginRequest, RefreshTokenRequest } from '../types/auth';
import { verifyRefreshToken, generateTokens } from '../utils/jwt';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, username, password, name } = req.body as RegisterRequest;

      // Validate input
      if (!email || !username || !password || !name) {
        return res.status(400).json({
          error: 'All fields are required',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'Password must be at least 6 characters long',
        });
      }

      const authResponse = await AuthService.register({
        email,
        username,
        password,
        name,
      });

      res.status(201).json({
        message: 'User registered successfully',
        data: authResponse,
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body as LoginRequest;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required',
        });
      }

      const authResponse = await AuthService.login({ email, password });

      res.json({
        message: 'Login successful',
        data: authResponse,
      });
    } catch (error) {
      res.status(401).json({
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body as RefreshTokenRequest;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Refresh token is required',
        });
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Generate new tokens
      const tokens = generateTokens({
        userId: decoded.userId,
        email: decoded.email,
        username: decoded.username,
      });

      res.json({
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      res.status(403).json({
        error: 'Invalid refresh token',
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const user = await AuthService.getUserById(req.user.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'Profile retrieved successfully',
        data: { user },
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve profile',
      });
    }
  }

  static async logout(req: Request, res: Response) {
    // In a production app, you might want to blacklist the token
    // For now, we'll just return success since tokens are stateless
    res.json({
      message: 'Logout successful',
    });
  }
}