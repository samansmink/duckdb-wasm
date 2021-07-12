import * as duckdb from '../src/';

export function testBindings(db: () => duckdb.DuckDBBindings, baseURL: string): void {
    let conn: duckdb.DuckDBConnection;

    beforeEach(() => {
        conn = db().connect();
    });

    afterEach(() => {
        conn.disconnect();
        db().flushFiles();
        db().dropFiles();
    });

    describe('DuckDBBindings', () => {
        describe('error handling', () => {
            it('INVALID SQL', async () => {
                let error: Error | null = null;
                try {
                    conn.sendQuery('INVALID');
                } catch (e) {
                    error = e;
                }
                expect(error).not.toBe(null);
            });
        });

        describe('Open', () => {
            // XXX apparently synchronous XHR on the main thread does not allow for arraybuffer response type?
            //     WTF why?
            // it('Remote TPCH 0_01', async () => {
            //     await db().registerFileURL('tpch_0_01.db', `${baseURL}/tpch/0_01/duckdb/db`);
            //     db().open('tpch_0_01.db');
            // });
        });

        describe('Prepared Statement', () => {
            it('Materialized', async () => {
                const stmt = conn.createPreparedStatement(
                    'SELECT v::INTEGER + ? AS v FROM generate_series(0, 10000) as t(v);',
                );
                const result = conn.runPreparedStatement(stmt, [234]);
                expect(result.length).toBe(10001);
                conn.closePreparedStatement(stmt);
            });

            it('Streaming', async () => {
                const stmt = conn.createPreparedStatement(
                    'SELECT v::INTEGER + ? AS v FROM generate_series(0, 10000) as t(v);',
                );
                const stream = conn.sendPreparedStatement(stmt, [234]);
                let size = 0;
                for (const batch of stream) {
                    size += batch.length;
                }
                expect(size).toBe(10001);
                conn.closePreparedStatement(stmt);
            });
            it('Typecheck', async () => {
                conn.runQuery(`CREATE TABLE typecheck (
                    a BOOLEAN DEFAULT NULL,
                    b TINYINT DEFAULT NULL,
                    c SMALLINT DEFAULT NULL,
                    d INTEGER DEFAULT NULL,
                    e BIGINT DEFAULT NULL,
                    f FLOAT DEFAULT NULL,
                    g DOUBLE DEFAULT NULL,
                    h CHAR(11) DEFAULT NULL,
                    i VARCHAR(11) DEFAULT NULL
                )`);

                const stmt = conn.createPreparedStatement('INSERT INTO typecheck VALUES(?,?,?,?,?,?,?,?,?)');
                expect(() =>
                    conn.runPreparedStatement(stmt, [
                        true,
                        100,
                        10_000,
                        1_000_000,
                        5_000_000_000,
                        0.5,
                        Math.PI,
                        'hello world',
                        'hi',
                    ]),
                ).not.toThrow();
                expect(() =>
                    conn.runPreparedStatement(stmt, [
                        'test', // varchar for bool
                        100,
                        10_000,
                        1_000_000,
                        5_000_000_000,
                        0.5,
                        Math.PI,
                        'hello world',
                        'hi',
                    ]),
                ).toThrow();
                expect(() =>
                    conn.runPreparedStatement(stmt, [
                        true,
                        10_000, // smallint for tinyint
                        10_000,
                        1_000_000,
                        5_000_000_000,
                        0.5,
                        Math.PI,
                        'hello world',
                        'hi',
                    ]),
                ).toThrow();
                expect(() =>
                    conn.runPreparedStatement(stmt, [
                        true,
                        100,
                        1_000_000, // int for smallint
                        1_000_000,
                        5_000_000_000,
                        0.5,
                        Math.PI,
                        'hello world',
                        'hi',
                    ]),
                ).toThrow();
                expect(() =>
                    conn.runPreparedStatement(stmt, [
                        true,
                        100,
                        10_000,
                        5_000_000_000, // bigint for int
                        5_000_000_000,
                        0.5,
                        Math.PI,
                        'hello world',
                        'hi',
                    ]),
                ).toThrow();
                conn.closePreparedStatement(stmt);
            });
        });
    });
}

export function testAsyncBindings(adb: () => duckdb.AsyncDuckDB, baseURL: string): void {
    let conn: duckdb.AsyncDuckDBConnection;

    beforeEach(async () => {
        conn = await adb().connect();
    });

    afterEach(async () => {
        await conn.disconnect();
        await adb().flushFiles();
        await adb().dropFiles();
    });

    describe('Open', () => {
        it('Remote TPCH 0_01', async () => {
            await adb().registerFileURL('tpch_0_01.db', `${baseURL}/tpch/0_01/duckdb/db`);
            await adb().open('tpch_0_01.db');
        });
    });
}
