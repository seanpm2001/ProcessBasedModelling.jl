var documenterSearchIndex = {"docs":
[{"location":"","page":"Documentation","title":"Documentation","text":"ProcessBasedModelling","category":"page"},{"location":"#ProcessBasedModelling","page":"Documentation","title":"ProcessBasedModelling","text":"ProcessBasedModelling.jl\n\n(Image: docsdev) (Image: docsstable) (Image: CI) (Image: codecov) (Image: Package Downloads)\n\nProcessBasedModelling.jl is an extension to ModelingToolkit.jl (MTK) for building a model of equations using symbolic expressions. It is an alternative framework to MTK's native component-based modelling, but, instead of components, there are \"processes\". This approach is useful in the modelling of physical/biological/whatever systems, where each variable corresponds to a particular physical concept or observable and there are few (or none) duplicate variables to make the definition of MTK \"factories\" worthwhile. On the other hand, there plenty of different physical representations, or processes to represent a given physical concept in equation form. In many scientific fields this approach parallels the modelling reasoning of the researcher more closely than the \"components\" approach.\n\nBeyond this reasoning style, the biggest strength of ProcessBasedModelling.jl is the informative errors and automation it provides regarding incorrect/incomplete equations. When building the MTK model via ProcessBasedModelling.jl the user provides a vector of \"processes\": equations or custom types that have a well defined and single left-hand-side variable. This allows ProcessBasedModelling.jl to:\n\nIterate over the processes and collect new variables that have been introduced by a provided process but do not themselves have a process assigned to them.\nFor these collected \"process-less\" variables:\nIf there is a default process defined, incorporate this one into the model\nIf there is no default process but the variable has a default value, equate the variable to a parameter that has the same default value and throw an informative warning.\nElse, throw an informative error saying exactly which originally provided variable introduced this new \"process-less\" variable.\nThrow an informative error if a variable has two processes assigned to it (by mistake).\n\nIn our experience, and as we also highlight explicitly in the online documentation, this approach typically yields simpler, less ambiguous, and more targeted warning or error messages than the native MTK one's. This leads to faster identification and resolution of the problems with the composed equations.\n\nProcessBasedModelling.jl is particularly suited for developing a model about a physical/biological/whatever system and being able to try various physical \"rules\" (couplings, feedbacks, mechanisms, ...) for a given physical observable efficiently. This means switching arbitrarily between different processes that correspond to the same variable. Hence, the target application of ProcessBasedModelling.jl is to be a framework to develop field-specific libraries that offer predefined processes without themselves relying on the existence of context-specific predefined components. An example usage is in ConceptualClimateModels.jl.\n\nBesides the informative errors, ProcessBasedModelling.jl also\n\nProvides a couple of common process subtypes out of the box to accelerate development of field-specific libraries.\nMakes named MTK variables and parameters automatically, corresponding to parameters introduced by the by-default provided processes. This typically leads to intuitive names without being explicitly coded, while being possible to opt-out.\nProvides some utility functions for further building field-specific libraries.\n\nSee the documentation online for details on how to use this package as well as examples highlighting its usefulness.\n\nProcessBasedModelling.jl development is funded by UKRI's Engineering and Physical Sciences Research Council, grant no. EP/Y01653X/1 (grant agreement for a EU Marie Sklodowska-Curie Postdoctoral Fellowship for George Datseris).\n\n\n\n\n\n","category":"module"},{"location":"","page":"Documentation","title":"Documentation","text":"note: Basic familiarity with ModelingToolkit.jl\nThese docs assume that you have some basic familiarity with ModelingToolkit.jl. If you don't going through the introductory tutorial of ModelingToolkit.jl should be enough to get you started!","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"note: Default `t` is unitless\nLike ModelingToolkit.jl, ProcessBasedModelling.jl also exports t as the independent variable representing time. However, instead of the default t of ModelingToolkit.jl, here t is unitless. Do t = ModelingToolkit.t to obtain the unitful version of t.","category":"page"},{"location":"#Usage","page":"Documentation","title":"Usage","text":"","category":"section"},{"location":"","page":"Documentation","title":"Documentation","text":"In ProcessBasedModelling.jl, each variable is governed by a \"process\". Conceptually this is just an equation that defines the given variable. To couple the variable with the process it is governed by, a user either defines simple equations of the form variable ~ expression, or creates an instance of Process if the left-hand-side of the equation needs to be anything more complex (or, simply if you want to utilize the conveniences of predefined processes). In either case, the variable and the expression are both symbolic expressions created via ModellingToolkit.jl.","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"Once all the processes about the physical system are collected, they are given as a Vector to the processes_to_mtkmodel central function, similarly to how one gives a Vector of Equations to e.g., ModelingToolkit.ODESystem. processes_to_mtkmodel also defines what quantifies as a \"process\" in more specificity. Then processes_to_mtkmodel ensures that all variables in the relational graph of your equations have a defining equation, or throws informative errors/warnings otherwise. It also provides some useful automation, see the example below.","category":"page"},{"location":"#Example","page":"Documentation","title":"Example","text":"","category":"section"},{"location":"","page":"Documentation","title":"Documentation","text":"Let's say we want to build the system of equations","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"dotz = x^2 - z \ndotx = 01y \ny = z - x","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"symbolically using ModelingToolkit.jl (MTK). We define","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"using ModelingToolkit\n\n@variables t # independent variable _without_ units\n@variables z(t) = 0.0\n@variables x(t) # no default value\n@variables y(t) = 0.0","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"ProcessBasedModelling.jl (PBM) strongly recommends that all defined variables have a default value at definition point. Here we didn't do this for x to illustrate what how such an \"omission\" will be treated by PBM.","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"note: ModelingToolkit.jl is re-exported\nProcessBasedModelling.jl re-exports the whole ModelingToolkit package, so you don't need to be using both of them, just using ProcessBasedModelling.","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"To make the equations we want, we can use MTK directly, and call","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"eqs = [\n  Differential(t)(z) ~ x^2 - z\n  Differential(t)(x) ~ 0.1y\n  y ~ z - x\n]\n\nmodel = ODESystem(eqs, t; name = :example)\n\nequations(model)","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"All good. Now, if we missed the process for one variable (because of our own error/sloppyness/very-large-codebase), MTK will throw an error when we try to structurally simplify the model (a step necessary before solving the ODE problem):","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"# no errors:\nmodel = ODESystem(eqs[1:2], t; name = :example)","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"# here is the error\nmodel = structural_simplify(model)","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"ERROR: ExtraVariablesSystemException: The system is unbalanced.\nThere are 3 highest order derivative variables and 2 equations.\nMore variables than equations, here are the potential extra variable(s):\n z(t)\n x(t)\n y(t)","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"The error message is unhelpful as all variables are reported as \"potentially missing\". At least on the basis of our scientific reasoning however, both x z have an equation. It is y that x introduced that does not have an equation. Moreover, in our experience these error messages become increasingly less accurate or helpful when a model has many equations and/or variables. This makes it difficult to quickly find out where the \"mistake\" happened in the equations.","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"PBM resolves these problems and always gives accurate error messages when it comes to the construction of the system of equations. This is because on top of the variable map that MTK constructs automatically, PBM requires the user to implicitly provide a map of variables to processes that govern said variables. PBM creates the map automatically, the only thing the user has to do is to define the equations in terms of what processes_to_mtkmodel wants (which are either Processes or Equations as above).","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"For the majority of cases, PBM can infer the LHS variable a process \"defines\" automatically, just by passing in a vector of Equations, like in MTK. For cases where this is not possible a dedicated Process type is provided, whose subtypes act as wrappers around equations providing some additional conveniences.","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"Here is what the user defines to make the same system of equations via PBM:","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"using ProcessBasedModelling\n\nprocesses = [\n    ExpRelaxation(z, x^2),      # defines z, introduces x; `Process` subtype\n    Differential(t)(x) ~ 0.1*y, # defines x, introduces y; normal `Equation`\n    y ~ z - x,                  # defines y; normal `Equation`\n]","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"which is then given to","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"model = processes_to_mtkmodel(processes; name = :example)\nequations(model)","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"Notice that the resulting MTK model is not structural_simplify-ed, to allow composing it with other models. By default t is taken as the independent variable.","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"Now, in contrast to before, if we \"forgot\" a process, PBM will react accordingly. For example, if we forgot the process for x, then the construction will error informatively, telling us exactly which variable is missing, and because of which processes it is missing:","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"model = processes_to_mtkmodel(processes[[1, 3]])","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"ERROR: ArgumentError: Variable x(t) was introduced in process of variable z(t).\nHowever, a process for x(t) was not provided,\nthere is no default process for x(t), and x(t) doesn't have a default value.\nPlease provide a process for variable x(t).","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"If instead we \"forgot\" the y process, PBM will not error, but warn, and make y equal to a named parameter, since y has a default value. So, running:","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"model = processes_to_mtkmodel(processes[1:2])\nequations(model)","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"Makes the named parameter:","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"parameters(model)","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"and throws the warning:","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"┌ Warning: Variable y(t) was introduced in process of variable x(t).\n│ However, a process for y(t) was not provided,\n│ and there is no default process for it either.\n│ Since it has a default value, we make it a parameter by adding a process:\n│ `ParameterProcess(y)`.\n└ @ ProcessBasedModelling ...\\ProcessBasedModelling\\src\\make.jl:65","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"Lastly, processes_to_mtkmodel also allows the concept of \"default\" processes, that can be used for introduced \"process-less\" variables. Default processes are like processes and given as a 2nd argument to processes_to_mtkmodel. For example,","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"model = processes_to_mtkmodel(processes[1:2], processes[3:3])\nequations(model)","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"does not throw any warnings as it obtained a process for y from the given default processes.","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"note: Default processes example\nThe default process infrastructure of PBM is arguably its most powerful quality when it comes to building field-specific libraries. Its usefulness is illustrated in the derivative package ConceptualClimateModels.jl.","category":"page"},{"location":"#Special-handling-of-timescales","page":"Documentation","title":"Special handling of timescales","text":"","category":"section"},{"location":"","page":"Documentation","title":"Documentation","text":"In dynamical systems modelling the timescale associated with a process is a special parameter. That is why, if a timescale is given for either the TimeDerivative or ExpRelaxation processes, it is converted to a named @parameter by default:","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"processes = [\n    ExpRelaxation(z, x^2, 2.0),    # third argument is the timescale\n    TimeDerivative(x, 0.1*y, 0.5), # third argument is the timescale\n    y ~ z-x,\n]\n\nmodel = processes_to_mtkmodel(processes)\nequations(model)","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"parameters(model)","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"Note the automatically created parameters tau_x tau_z. This special handling is also why each process can declare a timescale via the ProcessBasedModelling.timescale function that one can optionally extend (although in our experience the default behaviour covers almost all cases).","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"If you do not want this automation, you can opt out in two ways:","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"Provide your own created parameter as the third argument in e.g., ExpRelaxation\nWrap the numeric value into LiteralParameter. This will insert the numeric literal into the equation.","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"See the section on automatic parameters for more related automation, such as the macro @convert_to_parameters which can be particularly useful when developing a field-specific library.","category":"page"},{"location":"#Main-API-functions","page":"Documentation","title":"Main API functions","text":"","category":"section"},{"location":"","page":"Documentation","title":"Documentation","text":"processes_to_mtkmodel\nregister_default_process!\ndefault_processes\ndefault_processes_eqs","category":"page"},{"location":"#ProcessBasedModelling.processes_to_mtkmodel","page":"Documentation","title":"ProcessBasedModelling.processes_to_mtkmodel","text":"processes_to_mtkmodel(processes::Vector [, default]; kw...)\n\nConstruct a ModelingToolkit.jl model/system using the provided processes and default processes. The model/system is not structurally simplified. During construction, the following automations improve user experience:\n\nVariable(s) introduced in processes that does not itself have a process obtain a default process from default.\nIf no default exists, but the variable(s) itself has a default numerical value, a ParameterProcess is created for said variable and a warning is thrown.\nElse, an informative error is thrown.\nAn error is also thrown if any variable has two or more processes assigned to it.\n\nprocesses is a Vector whose elements can be:\n\nAny instance of a subtype of Process. Process is a wrapper around Equation that provides some conveniences, e.g., handling of timescales or not having limitations on the left-hand-side (LHS) form.\nAn Equation. The LHS format of the equation is limited. Let x be a @variable and p be a @parameter. Then, the LHS can only be one of: x, Differential(t)(x), Differential(t)(x)*p, p*Differential(t)(x), however, the versions with p may fail unexpectedly. Anything else will error.\nA Vector of the above two, which is then expanded. This allows the convenience of functions representing a physical process that may require many equations to be defined (because e.g., they may introduce more variables).\nA ModelingToolkit.jl XDESystem, in which case the equations of the system are expanded as if they were given as a vector of equations like above. This allows the convenience of straightforwardly coupling with already existing XDESystems.\n\nDefault processes\n\nprocesses_to_mtkmodel allows for specifying default processes by giving default. These default processes are assigned to variables introduced in the main input processes, but themselves do not have an assigned process in the main input.\n\ndefault can be a Vector of individual processes (Equation or Process). Alternatively, default can be a Module. The recommended way to build field-specific modelling libraries based on ProcessBasedModelling.jl is to define modules/submodules that offer a pool of pre-defined variables and processes. Modules may register their own default processes via the function register_default_process!. These registered processes are used when default is a Module.\n\nKeyword arguments\n\ntype = ODESystem: the model type to make.\nname = nameof(type): the name of the model.\nindependent = t: the independent variable (default: @variables t). t is also exported by ProcessBasedModelling.jl for convenience.\nwarn_default::Bool = true: if true, throw a warning when a variable does not have an assigned process but it has a default value so that it becomes a parameter instead.\n\n\n\n\n\n","category":"function"},{"location":"#ProcessBasedModelling.register_default_process!","page":"Documentation","title":"ProcessBasedModelling.register_default_process!","text":"register_default_process!(process, m::Module; warn = true)\n\nRegister a process (Equation or Process) as a default process for its LHS variable in the list of default processes tracked by the given module. If warn, throw a warning if a default process with same LHS variable already exists and will be overwritten.\n\nYou can use default_processes to obtain the list of tracked default processes.\n\nnote: For developers\nIf you are developing a new module/package that is based on ProcessBasedModelling.jl, and within it you also register default processes, then enclose your register_default_process! calls within the module's __init__() function. For example:module MyProcesses\n# ...\n\nfunction __init__()\n    register_default_process!.(\n        [\n            process1,\n            process2,\n            # ...\n        ],\n        Ref(MyProcesses)\n    )\nend\n\nend # module\n\n\n\n\n\n","category":"function"},{"location":"#ProcessBasedModelling.default_processes","page":"Documentation","title":"ProcessBasedModelling.default_processes","text":"default_processes(m::Module)\n\nReturn the dictionary of default processes tracked by the given module. See also default_processes_eqs.\n\n\n\n\n\n","category":"function"},{"location":"#ProcessBasedModelling.default_processes_eqs","page":"Documentation","title":"ProcessBasedModelling.default_processes_eqs","text":"default_processes_eqs(m::Module)\n\nSame as default_processes, but return the equations of all processes in a vector format, which is rendered as LaTeX in Markdown to HTML processing by e.g., Documenter.jl.\n\n\n\n\n\n","category":"function"},{"location":"#predefined_processes","page":"Documentation","title":"Predefined Process subtypes","text":"","category":"section"},{"location":"","page":"Documentation","title":"Documentation","text":"ParameterProcess\nTimeDerivative\nExpRelaxation\nAdditionProcess","category":"page"},{"location":"#ProcessBasedModelling.ParameterProcess","page":"Documentation","title":"ProcessBasedModelling.ParameterProcess","text":"ParameterProcess(variable, value = default_value(variable)) <: Process\n\nThe simplest process which equates a given variable to a constant value that is encapsulated in a parameter. If value isa Real, then a named parameter with the name of variable and _0 appended is created. Else, if valua isa Num then it is taken as the paremeter directly.\n\nExample:\n\n@variables T(t) = 0.5\nproc = ParameterProcess(T)\n\nwill create the equation T ~ T_0, where T_0 is a @parameter with default value 0.5.\n\n\n\n\n\n","category":"type"},{"location":"#ProcessBasedModelling.TimeDerivative","page":"Documentation","title":"ProcessBasedModelling.TimeDerivative","text":"TimeDerivative(variable, expression [, τ])\n\nThe second simplest process that equates the time derivative of the variable to the given expression while providing some conveniences over manually constructing an Equation.\n\nIt creates the equation τ_$(variable) Differential(t)(variable) ~ expression by constructing a new @parameter with default value τ (if τ is already a @parameter, it is used as-is). If τ is not given, then 1 is used at its place and no parameter is created.\n\nNote that if iszero(τ), then the process variable ~ expression is created.\n\n\n\n\n\n","category":"type"},{"location":"#ProcessBasedModelling.ExpRelaxation","page":"Documentation","title":"ProcessBasedModelling.ExpRelaxation","text":"ExpRelaxation(variable, expression [, τ]) <: Process\n\nA common process for creating an exponential relaxation of variable towards the given expression, with timescale τ. It creates the equation:\n\nτn*Differential(t)(variable) ~ expression - variable\n\nWhere τn is a new named @parameter with the value of τ and name τ_($(variable)). If instead τ is nothing, then 1 is used in its place (this is the default behavior). If iszero(τ), then the equation variable ~ expression is created instead.\n\nThe convenience function\n\nExpRelaxation(process, τ)\n\nallows converting an existing process (or equation) into an exponential relaxation by using the rhs(process) as the expression in the equation above.\n\n\n\n\n\n","category":"type"},{"location":"#ProcessBasedModelling.AdditionProcess","page":"Documentation","title":"ProcessBasedModelling.AdditionProcess","text":"AdditionProcess(process, added...)\n\nA convenience process for adding processes added to the rhs of the given process. added can be a single symbolic expression. Otherwise, added can be a Process or Equation, or multitude of them, in which case it is checked that the lhs_variable across all added components matches the process.\n\n\n\n\n\n","category":"type"},{"location":"#Process-API","page":"Documentation","title":"Process API","text":"","category":"section"},{"location":"","page":"Documentation","title":"Documentation","text":"This API describes how you can implement your own Process subtype, if the existing predefined subtypes don't fit your bill!","category":"page"},{"location":"","page":"Documentation","title":"Documentation","text":"Process\nProcessBasedModelling.lhs_variable\nProcessBasedModelling.rhs\nProcessBasedModelling.timescale\nProcessBasedModelling.NoTimeDerivative\nProcessBasedModelling.lhs","category":"page"},{"location":"#ProcessBasedModelling.Process","page":"Documentation","title":"ProcessBasedModelling.Process","text":"Process\n\nA new process must subtype Process and can be used in processes_to_mtkmodel. The type must extend the following functions from the module ProcessBasedModelling:\n\nlhs_variable(p) which returns the variable the process describes (left-hand-side variable). There is a default implementation lhs_variable(p) = p.variable if the field exists.\nrhs(p) which is the right-hand-side expression, i.e., the \"actual\" process.\n(optional) timescale(p), which defaults to NoTimeDerivative.\n(optional) lhs(p) which returns the left-hand-side. Let τ = timescale(p). Then default lhs(p) behaviour depends on τ as follows:\nJust lhs_variable(p) if τ == NoTimeDerivative().\nDifferential(t)(p) if τ == nothing, or multiplied with a number if τ isa LiteralParameter.\nτ_var*Differential(t)(p) if τ isa Union{Real, Num}. If real, a new named parameter τ_var is created that has the prefix :τ_ and then the lhs-variable name and has default value τ. Else if Num, τ_var = τ as given.\nExplicitly extend lhs_variable if the above do not suit you.\n\n\n\n\n\n","category":"type"},{"location":"#ProcessBasedModelling.lhs_variable","page":"Documentation","title":"ProcessBasedModelling.lhs_variable","text":"ProcessBasedModelling.lhs_variable(p::Process)\n\nReturn the variable (a single symbolic variable) corresponding to p.\n\n\n\n\n\n","category":"function"},{"location":"#ProcessBasedModelling.rhs","page":"Documentation","title":"ProcessBasedModelling.rhs","text":"ProcessBasedModelling.rhs(process)\n\nReturn the right-hand-side of the equation governing the process.\n\n\n\n\n\n","category":"function"},{"location":"#ProcessBasedModelling.timescale","page":"Documentation","title":"ProcessBasedModelling.timescale","text":"ProcessBasedModelling.timescale(p::Process)\n\nReturn the timescale associated with p. See Process for more.\n\n\n\n\n\n","category":"function"},{"location":"#ProcessBasedModelling.NoTimeDerivative","page":"Documentation","title":"ProcessBasedModelling.NoTimeDerivative","text":"ProcessBasedModelling.NoTimeDerivative()\n\nSingleton value that is the default output of the timescale function for variables that do not vary in time autonomously, i.e., they have no d/dt derivative and hence the concept of a \"timescale\" does not apply to them.\n\n\n\n\n\n","category":"type"},{"location":"#ProcessBasedModelling.lhs","page":"Documentation","title":"ProcessBasedModelling.lhs","text":"ProcessBasedModelling.lhs(p::Process)\nProcessBasedModelling.lhs(eq::Equation)\n\nReturn the right-hand-side of the equation governing the process. If timescale is implemented for p, typically lhs does not need to be as well. See Process for more.\n\n\n\n\n\n","category":"function"},{"location":"#auto_params","page":"Documentation","title":"Automatic named parameters","text":"","category":"section"},{"location":"","page":"Documentation","title":"Documentation","text":"new_derived_named_parameter\n@convert_to_parameters\nLiteralParameter","category":"page"},{"location":"#ProcessBasedModelling.new_derived_named_parameter","page":"Documentation","title":"ProcessBasedModelling.new_derived_named_parameter","text":"new_derived_named_parameter(variable, value, extra::String; kw...)\n\nIf value isa Num return value. If value isa LiteralParameter, replace it with its literal value. Otherwise, create a new MTK @parameter whose name is created from variable (which could also be just a Symbol) by adding the extra string.\n\nKeywords:\n\nprefix = true: whether the extra is added at the start or the end, connecting with the with the connector.\nconnector = \"_\": what to use to connect extra with the name.\n\nFor example,\n\n@variables x(t)\np = new_derived_named_parameter(x, 0.5, \"τ\")\n\nNow p will be a parameter with name :τ_x and default value 0.5.\n\n\n\n\n\n","category":"function"},{"location":"#ProcessBasedModelling.@convert_to_parameters","page":"Documentation","title":"ProcessBasedModelling.@convert_to_parameters","text":"@convert_to_parameters vars...\n\nConvert all variables vars into @parameters with name the same as vars and default value the same as the value of vars. The macro leaves unaltered inputs that are of type Num, assumming they are already parameters. It also replaces LiteralParameter inputs with its literal values. This macro is extremely useful to convert e.g., keyword arguments into named parameters, while also allowing the user to give custom parameter names, or to leave some keywords as numeric literals.\n\nExample:\n\njulia> A, B = 0.5, 0.5\n(0.5, 0.5)\n\njulia> C = first(@parameters X = 0.5)\n\njulia> @convert_to_parameters A B C\n3-element Vector{Num}:\n A\n B\n X\n\njulia> typeof(A) # `A` is not a number anymore!\nNum\n\njulia> default_value(A)\n0.5\n\njulia> C # the binding `C` still corresponds to parameter named `:X`!\n X\n\n\n\n\n\n","category":"macro"},{"location":"#ProcessBasedModelling.LiteralParameter","page":"Documentation","title":"ProcessBasedModelling.LiteralParameter","text":"LiteralParameter(p)\n\nA wrapper around a value p to indicate to new_derived_named_parameter or @convert_to_parameters to not convert the given parameter p into a named @parameters instance, but rather keep it as a numeric literal in the generated equations.\n\n\n\n\n\n","category":"type"},{"location":"#Utility-functions","page":"Documentation","title":"Utility functions","text":"","category":"section"},{"location":"","page":"Documentation","title":"Documentation","text":"default_value\nhas_symbolic_var","category":"page"},{"location":"#ProcessBasedModelling.default_value","page":"Documentation","title":"ProcessBasedModelling.default_value","text":"default_value(x)\n\nReturn the default value of a symbolic variable x or nothing if it doesn't have any. Return x if x is not a symbolic variable. The difference with ModelingToolkit.getdefault is that this function will not error on the absence of a default value.\n\n\n\n\n\n","category":"function"},{"location":"#ProcessBasedModelling.has_symbolic_var","page":"Documentation","title":"ProcessBasedModelling.has_symbolic_var","text":"has_symbolic_var(eqs, var)\n\nReturn true if symbolic variable var exists in the equation(s) eq, false otherwise. This works for either @parameters or @variables. If var is a Symbol isntead of a Num, all variables are converted to their names and equality is checked on the basis of the name only.\n\nhas_symbolic_var(model, var)\n\nWhen given a MTK model (such as ODESystem) search in all the equations of the system, including observed variables.\n\n\n\n\n\n","category":"function"}]
}
