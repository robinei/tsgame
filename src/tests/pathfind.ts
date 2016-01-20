/// <reference path="../types/qunit.d.ts" />

QUnit.test("constructPath test", function(assert) {
    var path = Game.constructPath(0, 7, [0,0,1,
                                         0,0,2,
                                         0,8,5]);
    assert.deepEqual(path, [0,1,2,5,8,7]);
});

QUnit.test("makeNeighbourCalc test", function(assert) {
    var func = Game.makeNeighbourCalc(3, 3);
    var result = [];
    var count = func(4, result);
    assert.deepEqual(count, 8);
    assert.deepEqual(result, [1,2,5,8,7,6,3,0]);

    var func = Game.makeNeighbourCalc(3, 3);
    var result = [];
    var count = func(0, result);
    assert.deepEqual(count, 3);
    assert.deepEqual(result, [1,4,3,undefined,undefined,undefined,undefined,undefined]);

    var func = Game.makeNeighbourCalc(3, 3);
    var result = [];
    var count = func(8, result);
    assert.deepEqual(count, 3);
    assert.deepEqual(result, [5,7,4,undefined,undefined,undefined,undefined,undefined]);
});

QUnit.test("BinaryHeap simple test", function(assert) {
    var distances = [0,1,2,3,4];
    var heap_indexes = [-1,-1,-1,-1,-1];

    function is_less(node1, node2) {
        return distances[node1] < distances[node2];
    }
    function set_index(node, index) {
        heap_indexes[node] = index;
    }
    var heap = new Game.BinaryHeap<number>(is_less, set_index);

    function verify_indexes() {
        var expected = [];
        for (var i = 0; i < distances.length; ++i) {
            expected.push(heap.getArray().indexOf(i));
        }
        assert.deepEqual(heap_indexes, expected);
    }

    heap.push(4);
    assert.deepEqual(heap.getArray(), [4]);
    verify_indexes();

    heap.push(2);
    assert.deepEqual(heap.getArray(), [2,4]);
    verify_indexes();

    heap.push(3);
    assert.deepEqual(heap.getArray(), [2,4,3]);
    verify_indexes();

    distances[3] = 0;
    heap.swap_upward(heap_indexes[3]);
    assert.deepEqual(heap.getArray(), [3,4,2]);
    verify_indexes();

    var top = heap.pop();
    assert.deepEqual(top, 3);
    assert.deepEqual(heap.getArray(), [2,4]);
    verify_indexes();
});


QUnit.test("BinaryHeap sort test", function(assert) {
    var N = 1000;
    var distances = [];
    var heap_indexes = [];
    for (var i = 0; i < N; ++i) {
        distances.push(Math.random());
        heap_indexes.push(-1);
    }

    function is_less(node1, node2) {
        return distances[node1] < distances[node2];
    }
    function set_index(node, index) {
        heap_indexes[node] = index;
    }
    var heap = new Game.BinaryHeap<number>(is_less, set_index);

    function is_ordered(a) {
        for (var i = 1; i < a.length; ++i) {
            if (distances[a[i-1]] > distances[a[i]]) {
                return false;
            }
        }
        return true;
    }

    for (var i = 0; i < N; ++i) {
        heap.push(i);
    }

    for (var i = 0; i < 100; ++i) {
        var j = Math.floor(Math.random() * N);
        distances[j] -= 0.1;
        heap.swap_upward(heap_indexes[j]);
    }

    var result = [];
    for (var i = 0; i < N; ++i) {
        result.push(heap.pop());
    }
    assert.ok(is_ordered(result));
});