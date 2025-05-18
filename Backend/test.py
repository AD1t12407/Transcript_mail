import dotenv

dotenv.load_dotenv()

print(dotenv.get_key(".env", "OPENAI_API_KEY"))
