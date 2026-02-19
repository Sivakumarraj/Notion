import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";

export function createAuthController({ jwtSecret }) {
  return {
    async register(req, res) {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(409).json({ message: "Email already in use" });
      }

      const passwordHash = await User.hashPassword(password);
      const user = await User.create({ name, email, passwordHash });
      const token = signToken(user, jwtSecret);

      return res.status(201).json({ token, user: { id: user._id, name, email } });
    },

    async login(req, res) {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = signToken(user, jwtSecret);
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    }
  };
}
