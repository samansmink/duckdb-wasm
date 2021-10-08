import { setupDuckDBSync, writeReport } from './setup';
import {
    SystemBenchmarkContext,
    SystemBenchmark,
    ArqueroIntegerSortBenchmark,
    DuckDBSyncIntegerSortBenchmark,
    DuckDBSyncIntegerTopKBenchmark,
    ArqueroIntegerTopKBenchmark,
} from './system';
import { runSystemBenchmarks } from './suite';
import * as path from 'path';

async function main() {
    const baseDir = path.resolve(__dirname, '../../../');
    const duckdbSync = await setupDuckDBSync();
    const suite: SystemBenchmark[] = [
        new ArqueroIntegerSortBenchmark(1000, 1, 1),
        new ArqueroIntegerSortBenchmark(10000, 1, 1),
        new ArqueroIntegerSortBenchmark(100000, 1, 1),
        new ArqueroIntegerSortBenchmark(1000, 2, 2),
        new ArqueroIntegerSortBenchmark(10000, 2, 2),
        new ArqueroIntegerSortBenchmark(100000, 2, 2),
        new ArqueroIntegerTopKBenchmark(1000, 1, 1, 100),
        new ArqueroIntegerTopKBenchmark(10000, 1, 1, 100),
        new ArqueroIntegerTopKBenchmark(100000, 1, 1, 100),
        new DuckDBSyncIntegerSortBenchmark(duckdbSync, 1000, 1, 1),
        new DuckDBSyncIntegerSortBenchmark(duckdbSync, 10000, 1, 1),
        new DuckDBSyncIntegerSortBenchmark(duckdbSync, 100000, 1, 1),
        new DuckDBSyncIntegerSortBenchmark(duckdbSync, 1000, 2, 2),
        new DuckDBSyncIntegerSortBenchmark(duckdbSync, 10000, 2, 2),
        new DuckDBSyncIntegerSortBenchmark(duckdbSync, 100000, 2, 2),
        new DuckDBSyncIntegerTopKBenchmark(duckdbSync, 1000, 1, 1, 100),
        new DuckDBSyncIntegerTopKBenchmark(duckdbSync, 10000, 1, 1, 100),
        new DuckDBSyncIntegerTopKBenchmark(duckdbSync, 100000, 1, 1, 100),
    ];
    const ctx: SystemBenchmarkContext = {
        projectRootPath: baseDir,
        seed: Math.random(),
    };
    const results = await runSystemBenchmarks(ctx, suite);
    console.log(results);
    await writeReport(results, './benchmark_system_sort_int.json');
}

main();
