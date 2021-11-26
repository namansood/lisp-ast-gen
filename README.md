# lisp-ast-gen

Generates Lisp ASTs.

`html.ts` converts a Lisp-y markup into HTML.

```
(html ()
    (head ()
        (title () "Hello world!"))
    (body ()
        (h1 () "Hello world!" "How are you today?")
        (div ((class "class-1 class-2 class-3")) "This is my first LispHTML page!")))
```

becomes:

```
<html><head><title>Hello world!</title></head> <body><h1>Hello world! How are you today?</h1> <div class="class-1 class-2 class-3">This is my first LispHTML page!</div></body></html>
```

`js.ts` converts a Racket-y language into JavaScript.

```
(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))
(fact 5)
```

becomes:

```
const fact = (n) => (n<=1) ? (1) : (n*fact(n-1));
console.log(fact(5))
```

Code under MIT license, and also a work-in-progress.
