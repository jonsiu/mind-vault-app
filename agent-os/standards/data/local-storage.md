## Local data storage for desktop apps

- **Storage Location**: Store data in platform-specific app data directory
- **User Data**: Use app data directory (AppData, Application Support, .local/share)
- **Temp Data**: Use OS temp directory for temporary files
- **Cache**: Use cache directory for cacheable data
- **Database Choice**: Choose appropriate database (SQLite, LevelDB, IndexedDB)
- **File Format**: Use appropriate format (JSON, SQLite, binary)
- **Migration Strategy**: Implement data migration for schema changes
- **Encryption**: Encrypt sensitive data at rest
- **Backup**: Support data backup and restore
- **Import/Export**: Support data export for portability
- **Cleanup**: Clean up old data periodically
- **Storage Limits**: Monitor storage usage; warn when approaching limits
- **Concurrent Access**: Handle concurrent access to storage safely
- **Atomic Writes**: Use atomic writes to prevent corruption
